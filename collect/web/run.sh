#!/bin/bash

COLLECT_OPTION=${1:-"code"}
NUMBER_URLS=${2:-"10000"}
START_AT=${3:-"1"}

MOUNT_FOLDER=${PWD%/*};
INPUT="$MOUNT_FOLDER/input"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
collect_web /bin/bash -c "python /app/collectCode.py --collect_option $COLLECT_OPTION \
--number_urls $NUMBER_URLS --start_at $START_AT"
