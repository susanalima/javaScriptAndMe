#!/bin/bash
SUFFIX=${1:-"node-obf"}
CONFIG_FILE=${2:-"1.json"}

FOLDER="transform"
MOUNT_FOLDER="/home/susana/Documents/dataset-tool/$FOLDER"
INPUT="$MOUNT_FOLDER/input"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
transform_others /bin/bash -c "node /app/transform.js $SUFFIX $CONFIG_FILE"
