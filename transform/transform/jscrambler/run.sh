#!/bin/bash
CONFIG_FILE=${1:-"1.json"}

MOUNT_FOLDER=${PWD%/*/*};
INPUT="$MOUNT_FOLDER/input"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
transform_jscrambler /bin/bash -c "node /app/transform.js $CONFIG_FILE"
