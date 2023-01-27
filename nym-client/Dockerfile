# 1. This tells docker to use the Rust official image
FROM rust:1.66-slim-buster as build

# 2. Copy the files in your machine to the Docker image
RUN apt-get update && apt-get -y install pkg-config build-essential libssl-dev curl git && rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/nymtech/nym && cd nym && git checkout $(curl -sSL 'https://api.github.com/repos/nymtech/nym/releases' | grep nym-client | grep -E -o "nym-binaries-v[0-9]\.]?[0-9]\.]?[0-9]\]?" | sort | tail -n 1)
WORKDIR /nym
RUN grep -rl "127.0.0.1" clients  | xargs sed -i 's/127\.0\.0\.1/0\.0\.0\.0/g'

# Build your program for release
RUN cargo build --bin nym-client --release && echo "nym-client built !!!" || "nym-client failed to build."
RUN rm -rf target/release/deps/* target/release/build/*


FROM bitnami/minideb:latest
WORKDIR nym
COPY --from=build /nym/target/release/nym-client .

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && apt-get -y install ca-certificates && rm -rf /var/lib/apt/lists/*


RUN useradd -ms /sbin/nologin user
RUN mkdir -p /home/user/.nym
RUN chown -R user:user /home/user && chmod +x nym-client
USER user

CMD ./nym-client run --id docker-client
