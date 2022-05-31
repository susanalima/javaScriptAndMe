# Transformer

The Transformer is responsible for transforming a set of JavaScript files received as input. It is composed of three sub-modules: Scrapers; Jscrambler; and Others.

## Setup

1. Install [docker](https://docs.docker.com/get-docker/).

2. Install [docker-compose](https://docs.docker.com/compose/install/).

3. Give permissions to scripts.

    `cd scripts`

    `chmod +x init.sh`

    `chmod +x clean.sh`

    in jscrambler, scrapers and others folders:

    `chmod +x build.sh`

    `chmod +x run.sh`

4. Run init script to create required directory structure.

    `./scripts/init.sh`


6. Add files to be transformed to _./input_

7. Create _.env.local_ file in _./transform/transform/jscrambler_ with:

```
ACCESS_KEY=_YOUR_ACCESS_KEY_ (access key for your jscrambler account)
SECRET_KEY=_YOUR_SECRET_KEY_ (secret key for your jscrambler account)
APPLICATION_ID=APPLICATION_ID_ (appplication id for application in your jscrambler account)
```

## Build and Run

### Jscrambler

`cd transform/jscrambler`

build:

`./build.sh`

run:

`./run.sh <config_file>`

where:
* config_file: configuration file - "1.json" (default), "2.json", "3.json", "4.json", "5.json" or "6.json"
    * see [map.txt](./transform/transform/jscrambler/map.txt) for details on configuration.


### Scrapers

`cd transform/scrapers`

build:

`./build.sh`

run:

`./run.sh <suffix>`

where:

* suffix:
    * daftLogic: to use daftlogic obfuscator
    * javascript2img: to use javascript2img obfuscator

Note: code obfuscated with javascript2img often is broken/unparsable

Note: obfuscating with these tools takes a long time

### Others


`cd transform/others`

build:

`./build.sh`

run:

`./run.sh <suffix> <config_file>`

where:

* suffix:
    * javascript-obfuscator: to use javascript-obfuscator obfuscator 
    * jfogs: to use jfogs obfuscator
    * js-obfuscator: to use js-obfuscator obfuscator
    * node-obf: to use node-obf obfuscator
    * defendjs: to use defendjs obfuscator
    * jsfuck: to use jsfuck obfuscator
    * jsobfu: to use jsobfu obfuscator
    * babel-minify: to use babel-minify minifier
    * google-closure-compiler: to use Google Closure Compiler minifier
    * terser: to use terser minifier
    * uglify: to use Uglify-js minifier
    * yuicompressor: to use Yui Compressor minifier
* config_file: configuration file
    * javascript-obfuscator: "1.json", "2.json", "3.json", "4.json" or "5.json"
    * js-obfuscator: "1.json" or "2.json"
    * defendjs: "1.sh", "2.sh", "3.sh" or "4.sh"
    * jsobfu: "1.json", "2.json" or "3.json"



### Clean Scripts

`sudo ./scripts/clean.sh`


## Structure

```src
├── transform
│   ├── globals
│   ├── input
│   ├── logs
│   ├── output
│   │   ├── obfuscated
│   │   ├── minfied
│   ├── scripts
│   ├── transform
│   │   ├── jscrambler
│   │   ├── others
│   │   |   ├── tools
│   │   |   |   ├── minifiers
│   │   |   |   ├── obfuscators
│   │   ├── scrapers
│   │   |   ├── dafLogic
│   │   |   ├── javascript2img
```

_globals_ - This folder contains a file with the global variales used in the project.

_input_ - Just as the name implies, this folder houses the input files/directories for the program.

_logs_ - Just as the name implies, this folder houses the log files of the program.

_output_: This folder houses the output files of the program.

- _obfuscated_ - All the files obfuscated, divided by tool used.

- _minified_ - All the minified files, divided by tool used.

_scripts_ - Contains scripts to create and clean all the required logs, output and input folders.

_transform_ - Responsible for transforming a the files. It reads the files in _input/toTransform_ and transforms (obfuscates and minifies) them with a variety of tools.

- _jscrambler_ - Code for using [Jscrambler](https://jscrambler.com/) obfuscator. Written in JavaScript.

- _others_ - Code for using the remaining obfuscators. Written in JavaScript.

    - _tools_ - Code for each tool.

        - _minifiers_ - Code for each minifier([babel-minify](babeljs.io/docs/en/babel-minify), [Google Closure Compiler](https://developers.google.com/closure/), [terser](https://github.com/terser/terser), [UglifyJs](https://github.com/mishoo/UglifyJS), and [Yui Compressor](http://yui.github.io/yuicompressor/))
        
        - _obfuscators_ - Code for each obfuscator ([javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator), [js-obfuscator](https://github.com/caiguanhao/js-obfuscator), [defendjs](https://github.com/alexhorn/defendjs), [jsfuck](https://github.com/aemkei/jsfuck). and [jsObfu](https://github.com/rapid7/jsobfu/) )

- _scrapers_ - Constains the code for scrapping online tools. Uses Python with Selenium.

    - _daftLogic_ - Code for scrapping [Daft Logic](https://www.daftlogic.com/projects-online-javascript-obfuscator.htm), and transform a set of files.

    - _javascript2img_ - Code for scrapping [JavaScript2img](http://javascript2img.com/), and transform a set of files.

