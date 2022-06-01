# Collector

The Collector, as the name suggests, is responsible for collecting JavaScript code. This is done with three different and independent sub-modules - Webistes Collector, GitHub collector, and NPM Collector - that collect code from three sources respectively: websites; repositories on GitHub; and NPM packages. 

<p align="center">
  <img  src="https://user-images.githubusercontent.com/36470825/171268354-54d43306-1669-4b1d-8aab-58a469ca58b3.png">
  <p align="center">Fig1. Collector's Architecture.
</p>
</p>

Each module has two operating modes:
* _sources_: instructs the Collector that it should retrieve a list of sources from where the code will be collected (e.g sites to visit)
* _code_: instructs the Collector that it should walk-through a list of sources to collect their code. It is not required that this list is retrieved using the sources option, however it must follow the same format.


## Websites Collector

Collects code from websites (inline scripts and external references).

The _sources_ option retrieves a list of sites from the [Majestic Million](https://de.majestic.com/reports/majestic-million}{https://de.majestic.com/reports/majestic-million) service by scraping the service using Python and [BeautifulSoup](https://pypi.org/project/beautifulsoup4/). 

The _code_ option allows the collection of the JavaScript code from a list of websites. This is done with a scraper also implemented in Python and using [Selenium](https://pypi.org/project/selenium/}{https://pypi.org/project/selenium/). After allowing the loading of dynamic scripts for at most five seconds, the scraper parses the HTML code using BeautifulSoup to extract the script tags and their content.


## GitHub Collector

Collects code from GitHub repositories.

The _sources_ option collects a list of repositories to clone. This can be configured to retrieve three different types of JavaScript repositories available on GitHub - browser extensions, programs written in vanilla JavaScript, and repositories containing server-side code. 

The _code_ option iterates over the list of repositories and clones them. 


## NPM Collector

Collects code from NPM packages.

The _sources_ option of this sub-module parses a markdown from a [GitHiu Gist](https://gist.github.com/anvaka/8e8fa57c7ee1350e3491) that contains a list with frequently used \NPM packages. This markdown must be manually retrieved from the repository and added to the input folder inside the tool. 

The _code_ option iterates over this list of libraries and automatically downloads them.


# Setup and Run

Requires Docker.

## Setup


1. Install [docker](https://docs.docker.com/get-docker/).


3. Give permissions to scripts.

    In collect folder:

    `cd scripts`

    `chmod +x init.sh`

    `chmod +x clean.sh`

    In github, npm and web folders:

    `chmod +x build.sh`

    `chmod +x run.h`

4. Run init script to create required directory structure (`sudo` may be required).

    `./scripts/init.sh`
  
## Build and Run

### Websites Collector

`cd ./web`

build: 
`./build.sh`

run: 

`./run.sh <collect_option> <number_urls> <start_at>`

* collect_option (default = code):
    * "code": for collecting the javascript from the websites
    * "sources": for collecting urls from the [Majestic Million service](https://de.majestic.com/reports/majestic-million?)
* number_urls (default: 10000): number of sites to visit / collect
* start_at (default = 1):
    * if collection_option is "code": position of the urlsToVisit.txt list (./input/) to start visiting the urls
    * if collection_option is "sources": position of [Majestic Million service](https://de.majestic.com/reports/majestic-million?) list (./input/) to start retrieving urls

If collect_option is sources then the output is stored in the collect/input directory (as it will be used as input for collecting the sources)
If collect_option is code then the output is stored in the collect/output directory and the logs are stored in the logs/output directory.


Note: if something fails while retrieving javascript from the web the log whill say that the operation failed even if some files where collected successfully


### GitHub Collector

`cd ./github`

build: 

`./build.sh` 

run: 

`./run.sh <collect_option> <number_repos> <source> <start_at>`

* collect_option (default = code): 
    * "code": for cloning the repositories
    * "sources": for collecting urls from GitHub's REST API
* number_repos (default = 1000): number of repositories to clone 
* source (default = extensions):
    * "extensions": collect list of browser extensions
    * "vanilla": collect list of repositories written in vanilla javascript
    * "server": collect list of repositories wich contain server side code
* start_at (default = 1): position of the repositories list (./input/) to start cloning the repositories (only valid when collect_option = code)



If collect_option is sources then the output is stored in the collect/input directory (as it will be used as input for collecting the sources)
If collect_option is code then the output is stored in the collect/output directory and the logs are stored in the logs/output directory.


### NPM Collector

Go [here](https://gist.github.com/anvaka/8e8fa57c7ee1350e3491#file-01-most-dependent-upon-md) and copy the raw version of the file to npmsToDownloadRaw.md (./input/)

`cd ./npm`

build: 

`./build.sh`

run: 

`./run.sh <collect_option> <number_modules> <start_at>`

* collect_option (default == code): 
    * "code": for collecting the code from the modules
    * "sources": for collecting urls from [here](https://gist.github.com/anvaka/8e8fa57c7ee1350e3491#file-01-most-dependent-upon-md). 
* number_modules (default = 1000): number of modules to download 
* start_at (default = 1): position of the npmsToDownloadRaw.md list (./input/) to start downloading the packages (only valid when collect_option = code)


If collect_option is sources then the output is stored in the collect/input directory (as it will be used as input for collecting the sources)
If collect_option is code then the output is stored in the collect/output directory and the logs are stored in the logs/output directory.


## Scripts


init input, output and logs: `./scripts/init.sh`

clean input, output and logs: `./scripts/clean.sh`



## Structure

```src
├── collect
│   ├── github
│   ├── globals
│   ├── input
│   ├── logs
│   │   ├── github
│   │   ├── npm
│   │   ├── web
│   ├── npm
│   ├── output
│   │   ├── github
│   │   ├── npm
│   │   ├── web
│   ├── scripts
│   ├── web
```

_github_ - Responsible for collecting a list of repositories and to clone them. The list is collected with Github's REST API.

_globals_ - This folder contains a file with the global variales used in the project.

_input_ - This folder houses the input files for the program.

_logs_ - This folder houses the log files of the program.

- _github_ - Logs generated by the github component of the program.

- _npm_ - Logs generated by the npm component of the program.

- _web_ - Logs generated by the web component of the program.


_output_: This folder houses the output files of the program.

- _github_: Al the repositories collected from github.

- _npm_: All the modules collected from npm.

- _web_: ALl javascript code collected from the web (separeted in folders per website).

_npm_ - Responsible for downloading npm modules from [here](https://gist.github.com/anvaka/8e8fa57c7ee1350e3491#file-01-most-dependent-upon-md).

_scripts_ - Contains scripts to create and clean all the required logs, output and input folders.

_web_ - Responsible for collecting javascript from different websites. The list of websites is collected from  the [Majestic Million service](https://de.majestic.com/reports/majestic-million?)
