## SETUP

Before running replace the `/home/susana/Documents/dataset-tool/` in all `run.sh` files in the program by the absolute directory of the code on your workstation.



1. Install [docker](https://docs.docker.com/get-docker/).


3. Give permissions to scripts.

    `cd scripts`

    `chmod +x init.sh`

    `chmod +x clean.sh`

    In process subfolder:

    `chmod +x build.sh`

    `chmod +x run.h`

4. Run init script to create required directory structure (`sudo` required).

    `sudo ./scripts/init.sh`
  

## BUILD and RUN

`cd ./process`

build: 

`./build.sh`

run: 

`./run.sh <process_option> <second_option>`

* process_option:
    * minified: for filtering transformed files and generating the hash values
    * duplicated: for removing duplicated and generating unique ids and final output
* second_option:
    * input_subdirectory: subdirectory inside input folder with the files to process (if process_option is minified)
    * similarity_score: int representing similarity threshold (should be 40) (if process_option is duplicated)


## Scripts

init input, output and logs: `sudo ./scripts/init.sh`

clean input, output and logs: `sudo ./scripts/clean.sh`



## PROJECT STRUCTURE

```src
├── process
│   ├── globals
│   ├── input
│   ├── logs
│   ├── output
│   ├── process
│   ├── scripts
```

_globals_ - This folder contains a file with the global variales used in the project.

_input_ - Just as the name implies, this folder houses the input files for the program.

_logs_ - Just as the name implies, this folder houses the log files of the program.

_output_: This folder houses the output files of the program.

_process_ - Responsible for processing a set of files.
* Renames the files to give them a unique name
* Removes duplicated and similar files
* Removes transformed (obfuscated or minified) files
* Removes files with simple code

_scripts_ - Contains scripts to create and clean all the required logs, output and input folders.

