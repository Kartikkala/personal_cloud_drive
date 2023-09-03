#!/bin/bash

aria2c --enable-rpc --rpc-listen-all=true --rpc-allow-origin-all --disable-ipv6 &

npm start

