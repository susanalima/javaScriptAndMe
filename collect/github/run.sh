#!/bin/bash

COLLECT_OPTION=${1:-"code"}
NUMBER_REPOS=${2:-"1000"}
SOURCE=${3:-"extensions"}

FOLDER="collect"
MOUNT_FOLDER="/home/susana/Documents/dataset-tool/$FOLDER"
INPUT="$MOUNT_FOLDER/input"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
collect_github /bin/bash -c "python /app/collectCode.py --collect_option $COLLECT_OPTION \
--number_repos $NUMBER_REPOS --source $SOURCE"
