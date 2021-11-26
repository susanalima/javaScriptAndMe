#!/bin/bash
OPTION=${1:-"new"}


MOUNT_FOLDER=${PWD%/*};

COLLECT="$MOUNT_FOLDER/collect"

docker run -v $COLLECT:/app/collect \
utility /bin/bash -c "node addNewSubCollector.js $OPTION"
