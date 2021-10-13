#!/bin/bash
SUFFIX=${1:-"javascript2img"}

MOUNT_FOLDER=${PWD%/*/*};
INPUT="$MOUNT_FOLDER/input"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
transform_scrapers /bin/bash -c "python /app/transform.py $SUFFIX"
