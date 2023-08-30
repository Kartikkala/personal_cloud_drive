#!/bin/bash

sshpass -P passphrase -p $SSH_PASS ssh $SSH_USR@$SSH_SERVER_ADDRESS -i $SSH_PRIVKEY docker pull kartikkala/mirror_website:$VERSION
sshpass -P passphrase -p $SSH_PASS ssh $SSH_USR@$SSH_SERVER_ADDRESS -i $SSH_PRIVKEY CONTAINER_ID=$(docker ps -q --filter "ancestor=kartikkala/mirror_website")
sshpass -P passphrase -p $SSH_PASS ssh $SSH_USR@$SSH_SERVER_ADDRESS -i $SSH_PRIVKEY docker kill CONTAINER_ID
sshpass -P passphrase -p $SSH_PASS ssh $SSH_USR@$SSH_SERVER_ADDRESS -i $SSH_PRIVKEY docker run -d kartikkala/mirror_website:$VERSION
