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




## Setup


1. Install [docker](https://docs.docker.com/get-docker/).


3. Give permissions to scripts.

    `cd scripts`

    `chmod +x init.sh`

    `chmod +x clean.sh`

    In process subfolder:

    `chmod +x build.sh`

    `chmod +x run.h`

4. Run init script to create required directory structure (`sudo` required).

    `./scripts/init.sh`
  

## Build and Run

`cd ./process`

build: 

`./build.sh`

run: 

`./run.sh <process_option> <second_option>`

* process_option:
    * minified: for filtering transformed files and generating the hash values
    * duplicated: for removing duplicated and generating unique ids and final output (should be run after running the minified option)
* second_option:
    * similarity_score: int representing similarity threshold (should be 40) (if process_option is duplicated)


If process_option is minified:
* logs.txt in process/logs contains the logs of files that were filter because they were consider to be minified or obfuscated, or had parsing errors
* pre_logs.txt contains the rest of the files and their corresponding hash values

If process_option is duplicated:
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

