# Collector


The Collector is responsible for collecting JavaScript. It implements three sub-modules that collect code from three different sources: websites; repositories on GitHub; and NPM packages. However, it can be extended to collect code from other sources if required. For each source, the collector implements a module that can be built and ran independently. Each module has two operating modes:
* sources: instructs the Collector that it should retrieve a list of sources from where the code will be collected.
* code: instructs the Collector that it should walk-through a list of sources to collect their code. It is not required that this list is retrieved using the sources option, however it must follow the same format.


\textbf{Websites Collector.}  Client-side JavaScript can be obtained by crawling different websites, allowing a closer representation of JavaScript in the wild. The code can be collected by extracting inline scripts or by downloading code referenced by external files in the website's HTML. The \textbf{sources} option of this sub-module retrieves a list of sites  from the \textit{Majestic Million}~\footnote{\href{https://de.majestic.com/reports/majestic-million}{https://de.majestic.com/reports/majestic-million}} service. This service offers a ranking of the top sites worldwide free of charge. To accomplish this, it scraps the \emph{Majectic Million} website using Python and \textit{BeautifulSoup}~\footnote{\href{https://pypi.org/project/beautifulsoup4/}{https://pypi.org/project/beautifulsoup4/}} to retrieve the list of sites to visit. The \textbf{code} option allows the collection of the JavaScript code from a list of websites provided. This is done with a scraper also implemented in Python and using \textit{Selenium}~\footnote{\href{https://pypi.org/project/selenium/}{https://pypi.org/project/selenium/}} to visit each site. After allowing the loading of dynamically generated code for at most five seconds, the scraper parses the HTML code using \textit{BeautifulSoup} to extract the script tags and their content. Inline scripts are copied to files, and external references are downloaded. The number of sites to visit can be configured in both operating modes. The implementation of this sub-module makes use of the latest version of the Chromium webdriver~\footnote{href{https://chromedriver.chromium.org/}{https://chromedriver.chromium.org/}}, each is installed inside the Docker to be able to visit the websites.


__GitHub Collector.__ Software hosting platforms, such as GitHub, contain a large variety of code for open-source websites, applications, and other programs. The _sources_ option of this sub-module collects a list of repositories to clone. This can be configured to retrieve three different types of JavaScript repositories available on GitHub - browser extensions, programs written in vanilla JavaScript, and repositories containing server-side code. This is done by issuing requests to GitHub's REST API to retrieve the URLS of a desired number of repositories of one of these types. The _code_ option iterates over the list of repositories and clones them. 


__NPM Collector.__ Package managers such as NPM offer the possibility to easily install libraries to use in various projects. The \textbf{sources} option of this sub-module parses a markdown from a \textit{GitHub} gist~\footnote{\href{https://gist.github.com/anvaka/8e8fa57c7ee1350e3491}{https://gist.github.com/anvaka/8e8fa57c7ee1350e3491}} that contains a list with frequently used \textit{NPM} packages. This markdown must be manually retrieved from the repository and added to the input folder inside the tool. The \textbf{code} option goes through this list of repositories and automatically downloads the libraries.



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

4. Run init script to create required directory structure (`sudo` required).

    `./scripts/init.sh`
  
## Build and Run

### GITHUB

`cd ./github`

build: 

`./build.sh` 

run: 

`./run.sh <collect_option> <number_repos> <source> <start_at>`

* collect_option (default = code): 
    * "code": for collecting the javascript from the websites
    * "sources": for collecting urls from GitHub's REST API
* number_repos (default = 1000): number of repositories to clone 
* source (default = extensions):
    * "extensions": collect list of browser extensions
    * "vanilla": collect list of repositories written in vanilla javascript
    * "server": collect list of repositories wich contain server side code
* start_at (default = 1): position of the repositories list (./input/) to start cloning the repositories (only valid when collect_option = code)



If collect_option is sources then the output is stored in the collect/input directory (as it will be used as input for collecting the sources)
If collect_option is code then the output is stored in the collect/output directory and the logs are stored in the logs/output directory.




### NPM

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



### WEB

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
