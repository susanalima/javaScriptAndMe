#!/bin/bash
OPTION=${1:-"minified"}
SECOND_OPTION=${2:-"Default"}


MOUNT_FOLDER=${PWD%/*};
INPUT="$MOUNT_FOLDER/input"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
process /bin/bash -c "node /app/filterDuplicated.js $OPTION $SECOND_OPTION"
