#! /bin/bash

set -e

NAME_CLIENT=${NAME_CLIENT:-"pastenym-backend-client"}
CLIENTS_DIR=~/.nym/clients/${NAME_CLIENT}


if [ ! -d ${CLIENTS_DIR} ]; then
    echo "Init nym client"
    if [[ -v GATEWAY ]]; then
   	./nym-client init --id $NAME_CLIENT --gateway ${GATEWAY}
    else
   	./nym-client init --id $NAME_CLIENT
    fi
fi

echo "Run nym client"
./nym-client run --id  $NAME_CLIENT
