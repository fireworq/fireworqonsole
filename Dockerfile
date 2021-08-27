FROM golang:1.16 as builder
ARG NODE_VERSION
RUN : ${NODE_VERSION:?NODE_VERSION is required}
ENV PATH /xbuild/node-${NODE_VERSION}/bin:$PATH
ENV APP_DIR /go/src/github.com/fireworq/fireworqonsole

RUN apt-get update && apt-get install -y --no-install-recommends curl jq \
 && apt-get clean && rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/* \
 && mkdir -p /usr/local /xbuild \
 && git clone https://github.com/tagomoris/xbuild.git /usr/local/xbuild \
 && /usr/local/xbuild/node-install v${NODE_VERSION} /xbuild/node-${NODE_VERSION}

WORKDIR ${APP_DIR}
COPY . .
RUN make release PRERELEASE=

FROM alpine:3.14.2
ARG PORT=8888
ENV FIREWORQONSOLE_BIND 0.0.0.0:$PORT
ENV APP_DIR /go/src/github.com/fireworq/fireworqonsole

COPY --from=builder ${APP_DIR}/fireworqonsole /usr/local/bin/
EXPOSE $PORT
ENTRYPOINT ["/usr/local/bin/fireworqonsole"]
