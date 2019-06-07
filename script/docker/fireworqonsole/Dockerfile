# Dockerfile for Fireworqonsole
#
# $ docker build -t fireworqonsole .
# $ docker run --rm fireworqonsole

FROM golang:1.12

ARG NODE_VERSION
ENV PATH /xbuild/node-${NODE_VERSION}/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends curl jq \
 && apt-get clean && rm -rf /var/cache/apt/archives/* /var/lib/apt/lists/* \
 && go get github.com/Masterminds/glide \
 && go get github.com/tianon/gosu \
 && mkdir -p /usr/local /xbuild \
 && git clone https://github.com/tagomoris/xbuild.git /usr/local/xbuild \
 && /usr/local/xbuild/node-install ${NODE_VERSION} /xbuild/node-${NODE_VERSION}
