BIN=fireworqonsole
BUILD_OUTPUT=.
TEST_OUTPUT=.
GO=go
PRERELEASE=SNAPSHOT
BUILD=$$(git describe --always)
NODE=http://127.0.0.1:8080
BIND=0.0.0.0:8888
export GO111MODULE=on

.PHONY: all
all: clean build

.PHONY: build
build: npmbuild-dev assets/css/loaders.min.css
	touch AUTHORS CREDITS.go.json CREDITS.npm.json
	${GO} build -ldflags "-X main.Build=$(BUILD) -X main.Prerelease=DEBUG" -o ${BUILD_OUTPUT}/$(BIN) .

.PHONY: release
release: npmbuild-prod assets/css/loaders.min.css credits
	CGO_ENABLED=0 ${GO} build -ldflags "-X main.Build=$(BUILD) -X main.Prerelease=$(PRERELEASE)" -o ${BUILD_OUTPUT}/$(BIN) .

.PHONY: run
run: build
	npm run dev & ./${BIN} --bind=${BIND} --node=${NODE} --debug & wait

.PHONY: npmbuild-dev
npmbuild-dev:
	npm install
	npm run build

.PHONY: npmbuild-prod
npmbuild-prod:
	npm install
	npm run build:prod
	npm prune --production

assets/css/loaders.min.css: node_modules/loaders.css/loaders.min.css
	cp $< $@

.PHONY: credits
credits:
	GOOS= GOARCH= ${GO} run script/genauthors/genauthors.go > AUTHORS
	GO111MODULE=off GOOS= GOARCH= ${GO} get github.com/Songmu/gocredits/cmd/gocredits
	${GO} mod download
	gocredits -json | jq -r '.Licenses|map({"package":.Name,"url":.URL,"license":.Content})' > CREDITS.go.json
	script/credits-npm > CREDITS.npm.json

.PHONY: clean
clean:
	rm -f assets/css/loaders.min.css assets/js/bundle.* CREDITS.go.json CREDITS.npm.json
	rm -f $(BIN)
	${GO} clean || true
