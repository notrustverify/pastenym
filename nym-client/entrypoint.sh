#! /bin/bash

set -e

NAME_CLIENT=${NAME_CLIENT:-"docker-mixnode"}
CLIENTS_DIR=~/.nym/clients/${NAME_CLIENT}
FORCE_INIT=${FORCE_INIT:-false}
LISTENING_ADDRESS=${LISTENING_ADDRESS:-"127.0.0.1"}

EXEC_VERSION=$(./nym-client -V | tail -n1 | sed 's:nym-client::' |xargs)

if [ -f "${CLIENTS_DIR}/config/config.toml" ]; then
        CONFIG_VERSION=$(cat "${CLIENTS_DIR}/config/config.toml" | awk -F "=" '/version/ {print $2}' | xargs)
fi


if [[ $EXEC_VERSION != $CONFIG_VERSION || $FORCE_INIT == true ]];then 
   echo "Init nym client"
   if [[ -v GATEWAY ]]; then
   	./nym-client init --id $NAME_CLIENT --gateway ${GATEWAY}
       else
   	./nym-client init --id $NAME_CLIENT
   fi
fi

echo "Run nym client"
./nym-client run --id  $NAME_CLIENT --host ${LISTENING_ADDRESS}
