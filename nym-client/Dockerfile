# 1. This tells docker to use the Rust official image
FROM rust:1.66-slim-buster as build


# 2. Copy the files in your machine to the Docker image
RUN apt-get update && apt-get -y install pkg-config build-essential libssl-dev curl git && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/nymtech/nym && cd nym && git checkout $(curl -s 'https://api.github.com/repos/nymtech/nym/releases' | sed -n '0,/.*"tag_name": "\(nym-binaries.*\)",/s//\1/p')
WORKDIR /nym
RUN grep -rl "127.0.0.1" clients  | xargs sed -i 's/127\.0\.0\.1/0\.0\.0\.0/g'

# Build your program for release
RUN cargo build --release
RUN rm -rf target/release/deps/* target/release/build/*


FROM ubuntu:latest
WORKDIR nym
COPY --from=build /nym/target/release/nym-client .

RUN apt-get update && apt-get -y install pkg-config build-essential libssl-dev curl jq wget && rm -rf /var/lib/apt/lists/*

RUN wget http://nz2.archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb
RUN dpkg -i libssl1.1_1.1.1f-1ubuntu2.16_amd64.deb


RUN useradd -ms /bin/bash user
RUN chown user:user nym-client
RUN mkdir -p /home/user/.nym
RUN chown -R user:user /home/user
RUN chmod +x nym-client
USER user

CMD ./nym-client run --id docker-client
