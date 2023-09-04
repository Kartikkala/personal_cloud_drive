#!/bin/bash

echo $VERSION
SSH_CMD="sshpass -P passphrase -p $SSH_PASS ssh $SSH_USR@$SSH_SERVER_ADDRESS -i $SSH_PRIVKEY"

$SSH_CMD docker pull kartikkala/mirror_website:$VERSION-test
CONTAINER_ID=$($SSH_CMD docker ps -q --filter "ancestor=kartikkala/mirror_website")

if [ $BUILD == 'stable' ]
then

    if [ -z "$CONTAINER_ID" ] 
    then
        echo "Nothing is running!"
    else
        $SSH_CMD docker kill $CONTAINER_ID
    fi
    
fi

if [ $BUILD == 'stable' ]
then
    $SSH_CMD docker run -p 80:80 -d --mount type=bind,src=$HOME/Downloads,dst=/downloadables kartikkala/mirror_website:latest
else
    $SSH_CMD docker run -p 8000:80 -d --mount type=bind,src=$HOME/Downloads,dst=/downloadables kartikkala/mirror_website:$VERSION-test
fi