BIN=fireworqonsole
SHELL=/bin/bash -O globstar
BUILD_OUTPUT=.
TEST_OUTPUT=.
GO=go
PRERELEASE=SNAPSHOT
BUILD=$$(git describe --always)
NODE=http://127.0.0.1:8080
BIND=0.0.0.0:8888

all: clean build

build: generate
	npm install
	npm run build
	go-bindata -pkg assets -o assets/bindata.go -debug assets/...
	${GO} build -ldflags "-X main.Build=$(BUILD) -X main.Prerelease=DEBUG" -o ${BUILD_OUTPUT}/$(BIN) .

release: npmbuild credits generate
	go-bindata -pkg assets -o assets/bindata.go assets/...
	CGO_ENABLED=0 ${GO} build -ldflags "-X main.Build=$(BUILD) -X main.Prerelease=$(PRERELEASE)" -o ${BUILD_OUTPUT}/$(BIN) .

run: build
	npm run dev & ./${BIN} --bind=${BIND} --node=${NODE} & wait

deps:
	glide install
	${GO} get github.com/jteeuwen/go-bindata/...

npmbuild:
	npm install
	npm run build:prod
	npm prune --production

credits:
	${GO} run script/genauthors/genauthors.go > AUTHORS
	script/credits-go > CREDITS.go.json
	script/credits-npm > CREDITS.npm.json

generate: deps
	touch AUTHORS
	touch CREDITS.go.json CREDITS.npm.json
	go generate -x ./...

clean:
	rm -f **/bindata.go assets.go CREDITS.go.json CREDITS.npm.json
	rm -f $(BIN)
	${GO} clean

.PHONY: all build release run deps npmbuild credits generate clean

