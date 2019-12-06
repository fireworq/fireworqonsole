//go:generate go-assets-builder -p main -o assets.go LICENSE AUTHORS CREDITS.go.json CREDITS.npm.json
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"golang.org/x/net/proxy"

	log "github.com/Sirupsen/logrus"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	serverstarter "github.com/lestrrat-go/server-starter/listener"

	"github.com/fireworq/fireworqonsole/assets"
)

func main() {
	var (
		bind            string
		nodes           nodes
		shutdownTimeout uint
		debug           bool
		showVersion     bool
		showLicense     bool
		showCredits     bool
	)
	out := os.Stderr

	flags := flag.NewFlagSet(Name, flag.ContinueOnError)
	flags.SetOutput(out)
	flags.Usage = func() {
		fmt.Fprint(out, helpText)
	}

	flags.BoolVar(&debug, "debug", false, "")
	flags.BoolVar(&showVersion, "v", false, "")
	flags.BoolVar(&showVersion, "version", false, "")
	flags.BoolVar(&showLicense, "license", false, "")
	flags.BoolVar(&showCredits, "credits", false, "")
	flags.Var(&nodes, "node", "")
	flags.StringVar(&bind, "bind", "127.0.0.1:8888", "")
	flags.UintVar(&shutdownTimeout, "shutdown-timeout", 30, "")

	if err := flags.Parse(os.Args[1:]); err != nil {
		os.Exit(1)
	}

	if showVersion {
		fmt.Fprintf(out, "%s\n", versionString(" "))
		os.Exit(0)
	}

	if showLicense {
		fmt.Println(licenseText)
		os.Exit(0)
	}

	if showCredits {
		printCredits()
		os.Exit(0)
	}

	s := &server{
		logger: os.Stdout,
		mux:    mux.NewRouter().SkipClean(true),
	}

	var fs http.FileSystem = assets.Assets
	if debug {
		fs = http.Dir("assets")
	}
	static := http.FileServer(fs)

	prefix := "/api"
	dialer := initProxy()
	upstream := NewUpstream(prefix, nodes, dialer)

	s.Handle("/version", serveVersion)
	s.Handle("/credits", serveCredits)
	s.Handle(prefix+"/versions", upstream.ServeVersions)
	s.Handle(prefix+"/settings", upstream.ServeSettings)
	s.Handle(prefix+"/queue/{queue:[^/]+}", upstream.ServeQueue)
	s.Handle(prefix+"/queues/stats", upstream.ServeQueueListStats)
	s.Handle(prefix+"/queue/{queue:[^/]+}/stats", upstream.ServeQueueStats)
	s.Handle(prefix+"/node/{node:.+}", upstream.ServeNode)

	s.mux.Handle("/js/{_:.*}", static)
	s.mux.Handle("/css/{_:.*}", static)
	s.mux.Handle("/images/{_:.*}", static)
	s.mux.Handle("/favicon.ico", static)

	s.Handle(prefix+"/{_:.*}", upstream.ServeReverseProxy)

	s.mux.Handle("/{_:.*}", &index{handler: static})

	server := &http.Server{Addr: bind, Handler: s.mux}
	if err := graceful(server, time.Duration(shutdownTimeout)*time.Second); err != nil {
		log.Fatal(err)
	}
}

func initProxy() proxy.Dialer {
	dialer := proxy.FromEnvironment()
	client := http.DefaultClient
	client.Transport = &http.Transport{Dial: dialer.Dial}
	return dialer
}

func graceful(server *http.Server, shutdownTimeout time.Duration) error {
	listeners, err := serverstarter.ListenAll()
	if err == serverstarter.ErrNoListeningTarget {
		go func() {
			log.Infof("Starting server at %s ...", server.Addr)
			err := server.ListenAndServe()
			log.Info(err)
		}()
	} else if err != nil {
		return err
	} else {
		for _, listener := range listeners {
			listener := listener
			go func() {
				log.Info("Starting server under start_server ...")
				err := server.Serve(listener)
				log.Info(err)
			}()
		}
	}

	sigc := make(chan os.Signal, 1)
	signal.Notify(sigc, syscall.SIGTERM, syscall.SIGINT, syscall.SIGHUP)

	sig := <-sigc
	log.Infof(
		"Received signal %q; shutting down gracefully in %s ...",
		sig,
		shutdownTimeout,
	)

	ctx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()

	errc := make(chan error)
	go func() { errc <- server.Shutdown(ctx) }()

	select {
	case sig := <-sigc:
		log.Infof("Received second signal %q; shutdown now", sig)
		cancel()
		return server.Close()
	case err := <-errc:
		return err
	}
}

type server struct {
	logger io.Writer
	mux    *mux.Router
}

func (s *server) Handle(pattern string, h func(http.ResponseWriter, *http.Request)) {
	s.mux.Handle(pattern, handlers.LoggingHandler(s.logger, http.HandlerFunc(h)))
}

type index struct {
	handler http.Handler
}

func (i *index) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	req.URL.Path = "/"
	i.handler.ServeHTTP(w, req)
}

func serveVersion(w http.ResponseWriter, req *http.Request) {
	fmt.Fprintf(w, "%s\n", versionString(" "))
}

func versionString(sep string) string {
	var prerelease string
	if Prerelease != "" {
		prerelease = "-" + Prerelease
	}

	var build string
	if Build != "" {
		build = "+" + Build
	}

	return strings.Join([]string{Name, sep, Version, prerelease, build}, "")
}

type PackageInfo struct {
	Package string `json:"package"`
	Url     string `json:"url"`
	License string `json:"license"`
}

func serveCredits(w http.ResponseWriter, req *http.Request) {
	json := mustAsset("/CREDITS.npm.json")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Length", strconv.Itoa(len(json)))
	w.WriteHeader(200)
	w.Write(json)
}

func printCredits() {
	var (
		creditsGo  []PackageInfo
		creditsNpm []PackageInfo
	)
	json.Unmarshal(mustAsset("/CREDITS.go.json"), &creditsGo)
	json.Unmarshal(mustAsset("/CREDITS.npm.json"), &creditsNpm)

	credits := append(creditsGo, creditsNpm...)
	for _, pkg := range credits {
		fmt.Println(pkg.Package)
		fmt.Println(pkg.Url)
		fmt.Println("----------------------------------------------------------------")
		fmt.Println(pkg.License)
		fmt.Println("================================================================")
	}
}

func mustAsset(path string) []byte {
	f, err := Assets.Open(path)
	if err != nil {
		panic(err)
	}

	buf, err := ioutil.ReadAll(f)
	if err != nil {
		panic(err)
	}
	return buf
}

func mustAssetString(path string) string {
	return string(mustAsset(path))
}

type nodes []url.URL

func (us *nodes) String() string {
	return fmt.Sprint(*us)
}

func (us *nodes) Set(value string) error {
	for _, u := range strings.Split(value, ",") {
		url, err := url.Parse(u)
		if err != nil {
			return err
		}
		*us = append(*us, *url)
	}
	return nil
}

var (
	licenseText = mustAssetString("/LICENSE") + `
   Copyright (c) 2017 The Fireworqonsole Authors. All rights reserved.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

` + mustAssetString("/AUTHORS")

	helpText = `
Usage: fireworqonsole [options]

  A web console for Fireworq

Options:

  --node=<node>     Fireworq node URL.
                    There can be multiple nodes.

  --bind=<address>  Bind address of this server.
                    (default: 127.0.0.1:8888)

  --shutdown-timeout=<seconds>

                    Timeout which the server waits on gracefully
                    shutting down or restarting.

  --version, -v     Show the version string.

  --license         Show the license text.

  --credits         Show the library dependencies and their licenses.

  --help, -h        Show the help message.
`
)
