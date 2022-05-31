# JavaScript&Me

An open-source tool for the automatic collection, processing, and transformation of JavaScript code. This tool aims at facilitating the process of collecting and curating a large corpus of JavaScript code to potentiate and facilitate new research on JavaScript related tasks. The tool considers multiple sources of code and a diverse set of transformation tools. It can be easily customized to fit different requirements. 

## Requirements

The only requirements are to have Docker installed in your system and internet connection.


## Architecture

Regarding the design of the tool, our goal was to choose an architecture of independent modules, so that the user is able to easily choose the modules they desire, providing an easy customization experience. We also allow the easy customization of some parameters while running the tool - e.g number of websites to visit - in addition to a simple way to configure the parameters of the obfuscation tools contained in the tool - mostly through configuration files written in JSON. We also choose to use Docker containers to allow more interoperability with different systems and to have a general approach for running the tool (build and run).

![workflow2](https://user-images.githubusercontent.com/36470825/171258994-e4f73d86-8e73-4e81-a4ac-1fa91baed97c.png)
**Fig1**. Architecture.

As displayed in Fig1, the tool is composed of three main modules - [Collector](./collect/README.md), [Processor](./process/README.md), and [Transformer](./transform/README.md) -, each with its responsibilities. The tool can be applied as a pipeline, starting by collecting code with the Collector, processing it with the Processor and transforming it with the Transformer. However, the modules were implemented to be independent from each other. This means that we can use it without using all its modules and sub-modules. For example, we can  process a dataset with the Processor that was not built with Collector. We just have to make sure that the input of a module is the one it expects.

The details of each moduel including the process to setup and run them are in the following pages:
* [Collector](./collect/README.md)
* [Processor](./process/README.md)
* [Transformer](./transform/README.md)



## Extending the tool

The modules Collector and Transformer can be extended to include new sources of code, or new tools and configurations, respectively. This is done by either adding new sub-modules or updating the current ones to execute the required functionalities. To facilitate this process, the tool's source code has templates, called benchmarks, detailing how to incorporate these new functionalities in the code.

All modules - except for the Collector - are meant to run as a black box. They receive a dataset as input, perform an operation to that dataset, and output the resulting dataset. As the modules are independent, new modules can be added to the pipeline or used to replace an existing module, having no impact in the remaining modules. For example, the tool could be extended to extract methods from a program and store them in individual files. This could be achieved by adding a new module before or after the Processor. This module would receive as input a JavaScript dataset where each file is a program and output a JavaScript dataset where each file is a JavaScript method. The subsequent modules would still receive as input a JavaScript dataset; therefore, this change would not impact their functionality. Fig2 represents the architecture of the tool after adding a new sub-module to the Collector to collect code from a different source, and adding a new module to the tool, responsible for extracting methods from the programs received as input.

The Transfomer is composed of three sub-modules. To extend the Scrapers sub-module, it is required to add the logic to interact with a new website. To extend the Others sub-module, one could add new minifiers, new obfuscators, or additional configurations for the obfuscators, following the same logic implemented for similar tools. The Jscrambler sub-module is meant to only run the Jscrambler code integrity tool; however, it can be extended by adding new configurations.

![extendTool2](https://user-images.githubusercontent.com/36470825/171259557-6b525176-edb7-4b41-96a4-4387f8b1af24.png)
**Fig2**. Example of a way to extend the tool.

## Validation

As now, the tool does not offer any automated tests, therefore its validation was conducted manually. We believe this is an important component of every software and therefore this is something we hope to be able to work on in the future.

The Collector is not simple to test, however we could explore basic tests that target the connection to the API used to clone the repositories on the NPM sub-module, or the way the Web module is detecting the scripts in the page. We could validate the Processor with simple unit tests to check for the different types of files we filter, such as checking if a file is minified; if a file is duplicated from another; if a file is unparsable, etc. This way we could test the Processor is able to detect such cases. As of now this validation was made manually but we intent to add these tests in the future to be able to automatically test this module.

Finally, in regards to the Transformer we argue that the tests each independent tool provides are enough to validate them independently, therefore, indirectly validate our tool as well. However, another test that can be conducted is to select some repositories, or JavaScript libraries, that contain unit tests, transform that code with the tool, and run those tests on the transformed code. The only restriction is that the code must be a single, easy to replace, file, as our tool only considers one file programs. Some examples of libraries that could be used for this purpose are acorn, chartjs, esprima and jquery (among others). When considering obfuscation, the resulting code can be also assessed based on its potency, resilience, and cost, as described by the work of Collberg et al. However, we consider this type of assessment to be outside of the scope of this work.


## Limitations

We identify some limitations to our tool. Some are related to its implementation, therefore can be improved in future work. Others are related to external libraries that we use, namely the tools to transform the code. Our tool can be used to retrieve large amounts of code. However, it is limited to the device's memory as it stores the created dataset locally.

In the Collector module, the major limitation found is the time required to visit a website, as we set some periods of sleep throughout the code to allow the dynamic loading of JavaScript. Additionally, we do not interact with the page or navigate the website, which could allow the collection of more code per website. It should also be taken into account that code collected from websites is often minified, and if there is the need to process it with the Processor, the majority of code collected will be excluded. This means we need to collect a large corpus of code from websites to be able to build a reasonably sized dataset. Finally, code collected from NPM and GitHub often include files that are not JavaScript code, and these files are only discarded by the Processor. This is only an issue if the Processor is not applied after the Collector.

In the Processor module, we acknowledge the fact that processing the files can be very time and memory consuming when dealing with a large set of code. The processing time is related to the size and complexity of the code - larger files take longer to process.

Finally, in the Transformer, we found several limitations, primarily due to the obfuscators and minifiers used:

* Some obfuscators, such as jsfuck and JavaScript2img, often break the code, generating unparsable code.
* JSObfu tends to output very simple obfuscated code if the input file is small (less than 30 bytes), which is arguable not obfuscated - it is different from the original code but the behavior of the code is not concealed. Example, the code `$user_is_supporter = 1;`was transformed to `var y = 'k'.length`.
* Some obfuscators, such as jsfuck, output extremely large files, which could lead to memory issues. We recommend using them with files smaller than 20 kB.
* Jscrambler is not an open-source obfuscator, requiring the use of valid credentials to use it.
* The scrapers - DaftLogic and JavaScript2img can take a long time to transform a file as the tool waits for specific elements in the page to be available.
* The scrapers often fail due to errors in the page or the size of the input file.
* The scrapers may fail if there are changes in the websites, as the interactions made with the page are dependent on hardcoded metadata, such as input ids. 
* The minifiers can not be configured without changing our tool's source code.
* The module does can not be applied to transform entire applications, it only transforms individual files (this is a restriction but we argue that in the contexts were the tool would be more useful is not necessary to transform entire applications).

## Future Work

* Validation
* Refactoring


## Motivation

The motivation behind the development of our tool comes from the challenge of automatically detecting obfuscated JavaScript. As researchers in the areas of code transformations and web security, we wanted to implement a detector able to distinguish regular JavaScript from obfuscated JavaScript.  Malware is often concealed through obfuscation, which modifies the code to be hardly readable by humans and resilient to reverse engineering tools. Although obfuscation is used as a security measure for protecting intellectual property and preventing plagiarism, it is commonly employed to conceal malicious scripts and circumvent their detection by manual inspections and pattern-based security systems.  While obfuscation techniques are well known, they can be applied in different manners and combinations. Additionally, obfuscated code can be challenging to differentiate from standard JavaScript programming practices, such as minification, which is often used to reduce bandwidth usage and improve performance. 
As we intended to use machine learning classifiers, the necessity for a large dataset of both regular and obfuscated JavaScript code arose. There are datasets of JavaScript code available. However, they have some limitations, and, to our knowledge, there are no open-source tools available for creating a customized dataset.

Our work on obfuscation detection is available at [Automatic Identification of Obfuscated JavaScript using Machine Learning](https://repositorio-aberto.up.pt/bitstream/10216/135504/2/487162.pdf).



