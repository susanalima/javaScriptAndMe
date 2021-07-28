#!/bin/bash
OPTION=${1:-"filter"}
SECOND_OPTION=${2:-"Default"}
INPUT_DIR=${3:-"process/input"}


FOLDER="process"
MOUNT_FOLDER="/home/susana/Documents/teses/automatic-identification-of-obfuscated-javascript-using-machine-learning/$FOLDER"
INPUT="/home/susana/Documents/teses/automatic-identification-of-obfuscated-javascript-using-machine-learning/$INPUT_DIR"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
process /bin/bash -c "node /app/process.js $OPTION $SECOND_OPTION"
