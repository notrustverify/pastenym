# 1. This tells docker to use the Rust official image
FROM rust:1.66-slim-buster as build

# 2. Copy the files in your machine to the Docker image
RUN apt-get update && apt-get -y install pkg-config build-essential libssl-dev curl git && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/nymtech/nym && cd nym && git checkout $(curl -s 'https://api.github.com/repos/nymtech/nym/releases' | sed -n '0,/.*"tag_name": "\(nym-binaries.*\)",/s//\1/p')
WORKDIR /nym

# Build your program for release
RUN cargo build --bin nym-client --release && echo "nym-client built !!!" || "nym-client failed to build."
RUN rm -rf target/release/deps/* target/release/build/*


FROM bitnami/minideb:latest
WORKDIR nym
COPY --from=build /nym/target/release/nym-client .
COPY entrypoint.sh entrypoint.sh

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get -y install ca-certificates && rm -rf /var/lib/apt/lists/*


RUN groupadd -g 10000 user &&  useradd -u 10000 -g 10000 -ms /sbin/nologin user
RUN chown -R user:user /home/user && chmod +x nym-client && chmod +x entrypoint.sh
USER user

ENTRYPOINT ["./entrypoint.sh"]

