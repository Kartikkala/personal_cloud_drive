#!/bin/bash

aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --disable-ipv6 --bt-metadata-only=true --bt-save-metadata=true &

source /usr/share/nvm/init-nvm.sh && cd /home && nvm use 21 && npm start

