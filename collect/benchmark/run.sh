#!/bin/bash

COLLECT_OPTION=${1:-"code"}
NUMBER_REPOS=${2:-"1000"}
SOURCE=${3:-"extensions"}
START_AT=${4:-"1"}

MOUNT_FOLDER=${PWD%/*};
INPUT="$MOUNT_FOLDER/input"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
collect_BENCHMARK /bin/bash -c "COMMAND --collect_option $COLLECT_OPTION \
--number_repos $NUMBER_REPOS --source $SOURCE --start_at $START_AT"


# replace BENCHMARK with the name of the new submodule

# replace COMMAND with the command to run