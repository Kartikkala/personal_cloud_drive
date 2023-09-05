#!/bin/bash

SSH_CMD="sshpass -P passphrase -p $SSH_PASS ssh $SSH_USR@$SSH_SERVER_ADDRESS -i $SSH_PRIVKEY"

$SSH_CMD docker pull kartikkala/mirror_website:$VERSION-$BUILD
CONTAINER_NAME="mirror_website"


if [ $($SSH_CMD docker ps -q --filter "name=$CONTAINER_NAME") ] 
then
    echo "Container is running!"
    docker rm -f $CONTAINER_NAME
else
    docker rm -f $CONTAINER_NAME
    echo "Container is not running"
fi

$SSH_CMD docker run --name mirror_website -p $PORT:80 -d --mount type=bind,src=$HOME/Downloads,dst=/downloadables kartikkala/mirror_website:$VERSION-$BUILD