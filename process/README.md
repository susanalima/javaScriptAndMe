# Processor

The Processor is implemented in Node.js, and is responsible for processing JavaScript code to ensure the quality of the dataset. This processing aims to discard minified files; duplicated files; and unparsable code. Additionally, files are also excluded if they are empty or if there is a timeout in the processing. 

<p align="center">
  <img  src="https://user-images.githubusercontent.com/36470825/171437314-ed9d534f-115f-4327-be44-589f086b20b6.png">
  <p align="center">Fig1. Processor's Architecture.
</p>
</p>


We consider file as minified if it presents at least one of the following characteristics:
* A min.js extension. 
* Less than 1\% of indentation characters.
* On average, more than 100 characters per line.
* More than 10\% of its lines have more than 240 characters.


We consider two files as duplicated if they have a similarity score >= 40\%, in that case one of them is excluded. To compute this score, we use the [ctph.js](https://www.npmjs.com/package/ctph.js) library to compute the context-triggered piecewise hash for the minified version of each file and compare it with the ones computed for the previously processed files. 

To filter duplicated files we first minify them. If there are any parsing errors in this process, the file is considered unparsable and it is excluded.

Finally, empty files and files with one or fewer bytes are excluded.


# Setup and Run

Note: to stop the scripts you need to find the container and kill it. use:
* `docker ps` to find the container's id
* `docker stop <CONTAINER_ID>` to stop the docker

## Setup


1. Install [docker](https://docs.docker.com/get-docker/).


3. Give permissions to scripts.

    `cd scripts`

    `chmod +x init.sh`

    `chmod +x clean.sh`

    In process subfolder (`ćd process`)

    `chmod +x build.sh`

    `chmod +x run.sh`

4. Run init script to create required directory structure (`sudo` may be required).

    `./scripts/init.sh`
  

## Build and Run

`cd ./process`

build: 

`./build.sh`

run: 

`./run.sh <process_option> <second_option>`

* process_option:
    * step1 (default): for filtering transformed files and generating the hash values
    * step2: for removing duplicated and generating unique ids and final output (should be run after running the minified option)
* second_option:
    * true (default): 
        * step1: filters minified files and computes hash values
        * step2: filters duplicated files and generates unique ids and the final dataset
    * false: 
        * step1: computes hash values (without filtering minified files)
        * step2: generates unique ids and the final dataset (without filtering duplicated files)


First run the step1 option and then the step2 option.


If process_option is step1:
* logs.txt in process/logs contains the logs of files that were filter because they were consider to be minified or obfuscated, or had parsing errors
* pre_logs.txt contains the rest of the files and their corresponding hash values

If process_option is step2:
* logs.txt contains all logs for all files, filtered or not. Files that were not filtered are given a new name that is also present in the logs for full traceability
* all files kept are renamed and stored in process/output


## Scripts

init input, output and logs: `./scripts/init.sh`

clean input, output and logs: `./scripts/clean.sh`



## Structure

```src
├── process
│   ├── globals
│   ├── input
│   ├── logs
│   ├── output
│   ├── process
│   ├── scripts
```

_globals_ - This folder contains a file with the global variales used in the project. This includes the following thresholds that can be configured:
 * `PERCENTAGE_OF_INDENTATION_CHARACTERS_THRESHOLD` (defaults to 1): If a file has less than `PERCENTAGE_OF_INDENTATION_CHARACTERS_THRESHOLD` % of indentation characters it is considered to be minified.
 * `CHARACTERS_PER_LINE_THRESHOLD` (defaults to 100): If a file as on average, more than `CHARACTERS_PER_LINE_THRESHOLD` characters per line it is considered to be minified.
 * `PERCENTAGE_OF_LONG_LINES_THRESHOLD` (defaults to 10) and `NUMBER_CHARACTERS_THRESHOLD` (defaults to 240): If a file has more than `PERCENTAGE_OF_LONG_LINES_THRESHOLD` % of all lines has more than `NUMBER_CHARACTERS_THRESHOLD` characters it is considered to be minified.
 * `DUPLICATED_THRESHOLD` (defaults to 40): If the similarity score of two files is `DUPLICATED_THRESHOLD` % the files are considered to be duplicates.


_input_ - Just as the name implies, this folder houses the input files for the program.

_logs_ - Just as the name implies, this folder houses the log files of the program.

_output_: This folder houses the output files of the program.

_process_ - Responsible for processing a set of files.
* Renames the files to give them a unique name
* Removes duplicated and similar files
* Removes transformed (obfuscated or minified) files
* Removes files with simple code

_scripts_ - Contains scripts to create and clean all the required logs, output and input folders.

