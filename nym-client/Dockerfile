FROM ubuntu:latest
WORKDIR nym
COPY . .
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
