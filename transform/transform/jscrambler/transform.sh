#!/bin/sh


ACCESS_KEY=$1
SECRET_KEY=$2
APPLICATION_ID=$3
CONFIG_FILE=$4
OUTPUT_FILE=$5
INPUT_FILE=$6

./node_modules/'.bin'/jscrambler -a $ACCESS_KEY -s $SECRET_KEY -i $APPLICATION_ID -c $CONFIG_FILE -o $OUTPUT_FILE $INPUT_FILE

