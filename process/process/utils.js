const fs = require("fs");
const path = require("path");
const {v4: uuidv4} = require('uuid'); 
const Ctph = require('ctph.js');
const UglifyJS = require("uglify-js");
const Ast = require('abstract-syntax-tree')
const Esprima = require('esprima')
const Esmangle = require('esmangle')
const Escodegen = require('escodegen')
const StripComments = require('strip-comments');
const { line } = require("strip-comments");


/**
 * Directory to globals file
 */
 const GLOBALS_FILE = "./globals/globals.json"

 /**
  * Dictionay storing all the global variables
  */
 const globals = load_globals()
 
 
 


/**
 * Read content from globals file
 */
 function load_globals() {
    const data = fs.readFileSync(GLOBALS_FILE, "utf-8");
    return JSON.parse(data);
}


/**
 * Copy file content from a directory to another directory
 * @param {*} sourceDir File's source directory
 * @param {*} destinationDir Destination directory
 */
 function copy_file(sourceDir, destinationDir){
    fs.copyFileSync(sourceDir, destinationDir, (err) => {
        if (err) throw err;
    });
}

/**
 * Build an unique file id for a given file
 * @param {*} fileDir  Given file
 */
function build_fileId(fileDir) {
    const tokens = fileDir.split(globals.DIR_SEPARATOR)
    const fileName = tokens[tokens.length - 1].split(".")[0]
    return  fileName + globals.DEFAULT_SEPARATOR + uuidv4();
}



/**
 * Build the destination directory from where a file's content must be copied to
 * @param {*} fileDir File to copy
 * @param {*} folder Name of subdirectory to store the files
 */
function build_destination_dir(fileDir, folder){
    const fileId = build_fileId(fileDir)
    const dir = globals.PROCESS_OUTPUT_DIR + folder + globals.DIR_SEPARATOR 
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    return dir + fileId + globals.INPUT_FILE_EXTENSION;
}


/**
 * Build and format log data in case of successful operation
 * @param {*} sourceDir Original file dir
 * @param {*} destinationDir Modified file dir (contains unique id in name)
 * @param {*} fileSize Size of the file in kb
 * @param {*} hash Hash value of the file
 */
function build_logs_log_data_on_success(sourceDir, destinationDir, fileSize, hash){
    const currDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    return "LOG - " + 
    sourceDir + globals.LOG_SEPARATOR 
    + path.basename(destinationDir)  + globals.LOG_SEPARATOR 
    + currDate + globals.LOG_SEPARATOR + fileSize + "kb" 
    + globals.LOG_SEPARATOR + hash
    + globals.LOG_SEPARATOR + globals.LOG_SUCCESS 
    + " - ENDLOG"
    + globals.LOG_LINE_BREAK;
}

/**
 * Build and format log data in case of failed operation
 * @param {*} sourceDir Original file dir 
 * @param {*} destinationDir Modified file dir (contains unique id in name)
 * @param {*} hash Hash value of the file
 * @param {*} error Error message
 */
function build_logs_log_data_on_failure(sourceDir, destinationDir, hash, error = globals.DEFAULT_ERROR){
    const currDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    return "LOG - " + sourceDir + globals.LOG_SEPARATOR 
    + path.basename(destinationDir) 
    + globals.LOG_SEPARATOR + currDate 
    + globals.LOG_SEPARATOR + hash
    + globals.LOG_SEPARATOR + globals.LOG_FAILURE 
    + globals.LOG_LINE_BREAK +  globals.LOG_LINE_INDENTATION 
    + error + " - ENDLOG"
    + globals.LOG_LINE_BREAK;
}

/**
 * Write data to ../logs/processed/logs.txt
 * @param {*} data Data to write in the log
 */
function write_to_logs_log_file(data, directory = globals.PROCESSED_LOGS_LOG_DIR){
    fs.appendFileSync( directory, data, function (err) {
        if (err) throw err;
    });
}

/**
 * Write data to ../logs/input/processed.txt
 * @param {*} sourceDir Directory processed
 */
function write_to_pre_log_file(data){
    fs.appendFile(globals.PROCESSED_LOGS_PRE_DIR , data, function (err) {
        if (err) throw err;
    });
}

/**
 * Reads content of file and creates list with each line of the file
 * @param {*} file File to read
 */
function read_file_to_list(file){
    try {
        return fs.readFileSync(file).toString().split(globals.LOG_LINE_BREAK);
    } catch (error) {
        return []
    }
}

/**
 * Return list of all the directories that were previously processed
 */
function get_processed_dirs(){
    return read_file_to_list(globals.PROCESSED_PROCESSED_DIRS_LOG_DIR)
}


/**
 * Return list of all the directories that were previously processed
 */
 function get_processed_files(){
    const lines = read_file_to_list(globals.PROCESSED_LOGS_LOG_DIR)
    return lines.map( e => {
        const tokens = e.split(" - ")
        if (tokens[0] = "LOG")
            return tokens[1]
    })
}


/**
 * Return first directory number to store the processed files
 */
 function get_start_dir(){
    let dirs = fs.readdirSync(globals.PROCESS_OUTPUT_DIR)
    if (dirs.length === 0)
        return 0
    dirs = dirs.map(function (x) { 
        return parseInt(x,10); 
      });
    return Math.max(...dirs) + 1
}



/**
 * Get number of indentation characters in a string
 * @param {*} input String
 */
function get_number_indentation_characters(input){
    const regex = /\s|\n|\r/g;
    return (input.match(regex) || []).length;
}


/**
 * Check if a given string (of code) is transformed (minified or obfuscated)
 * A file is considered transformed if:
 *  * ".min.js" extension
 *  * less than 1% of indentations characters
 *  * on average, more than 100 characters per line (based on the fact that is good practice to keep the line at 80 characters)
 *  * more than 5% of words are control flow related (tries to catch obfuscation that applies control flow flattening transformations)
 *  * more than 10% of lines are longer than 240 characters
 * @param {*} fileName Name of the file containing the code
 * @param {*} input String of code
 * @param {*} linesThreshold Threshold to exclude the file based on the line length
 */
function check_transformed(fileName, input, linesThreshold=240){
    const checkMinRegex = /.*\.min\.js/
    const count = (fileName.match(checkMinRegex) || []).length;
    
    // check extension
    if (count > 0) 
        throw new Error("File may be minified: extension .min.js")    

    try {
        input = StripComments(input)
    } catch (error) {
        
    }
    const nrC = input.length
    const nrIndentationC = get_number_indentation_characters(input)
    const indentCharPercentage = nrIndentationC / nrC * 100

    // if there are less than 1% of indentation characters
    if (nrIndentationC / nrC * 100 <= 1)
        throw new Error(`File may be minified or obfuscated: ${Math.round(indentCharPercentage*100)/100}% of indentation characters (less or equal to 1%)`)    
    
    const lines = input.split(/\r?\n/)

    const nrLines =lines.length

    const averageNrCharLine = nrC / nrLines

    // if there are more than 100 characteres per line
    if (averageNrCharLine > 100) //recommended 80 characteres per line 
        throw new Error(`File may be minified or obfuscated: average of ${Math.round(averageNrCharLine*100)/100} characters per line (more than 100 characteres)`)    
    
    const longLines = lines.filter(elem => {
        return (elem.length >= linesThreshold)
    })

    const longLinesPercentage = longLines.length / nrLines * 100
    if ( longLinesPercentage > 10)
        throw new Error(`File may be minified or obfuscated: ${Math.round(longLinesPercentage*100)/100}% of lines have more than ${linesThreshold} characters (at least 10%)`)    
}

/**
 * Minify a code file using esprima and escodogen
 * @param {*} input Content of the file
 */
function esprima_minify(input) {
    let tree = {}
    let options = {
        "scopes": false,
        "comment": false,
        "attachComment": false,
        "loc": true,
        "range": true,
        "tokens": false,
        "tolerant": false,
        "ecmaVersion": 8
    }

    try {
        try {
            options.sourceType = 'script';
            tree = Esprima.parse(input, options);
        } catch (error) {
            options.sourceType = 'module';
            tree = Esprima.parse(input, options);
        }
    } catch (error) {
        throw new Error(error)
    }
    const result = Esmangle.mangle(tree);
    const output = Escodegen.generate(result, {
        format: {
            renumber: true,
            hexadecimal: false,
            escapeless: true,
            compact: true,
            semicolons: false,
            parentheses: false,
            comment: false,
        }
    })
    return output
}



/**
 * Compute a fuzzy hash for a file of code
 * 1. minify the file
 * 2. compute the hash of the minified file
 * @param {*} fileName Name of the file
 * @param {*} input Content of the file
 * @param {*} storeMinified Flag to store the minified code or not
 */
function compute_hash(fileName, input, min_func, storeMinified = false){
    
    let code = ""
    try {
        code = min_func(input)
    } catch (error) {
        throw new Error(`Unable to parse code:\n\t ${error}`)
    }

    const hash = Ctph.digest(code)

    return hash
}


/**
 * Get similarity score between to hash values
 * @param {*} hash1 Hash value
 * @param {*} hash2 Hash value
 * @returns 
 */
function get_similarity_score(hash1, hash2){
    return Ctph.similarity(hash1, hash2);
}


/**
 * Check if the given hash is a duplicate to another hash stored
 * @param {*} hash Current hash
 * @param {*} hashFiles List of stored hash valyes
 * @param {*} filesToProcess Files to be processed
 * @param {*} threshold Threshold for similarity score
 */
function check_duplicates(hash, hashFiles, filesToProcess, threshold=60){
    let dupHash = undefined
    let dupScore = 0
    let index = 0;
    hashFiles.every(value => {
        const score = get_similarity_score(hash, value)
        if (Math.round(score) >= threshold){
            dupHash = value
            dupScore = score
            return false
        }
        index++;
        return true
    });
    if (dupHash !== undefined){
        let simFile
        if(index >= filesToProcess.length)
            simFile="unknown"
        else 
            simFile = filesToProcess[index]
        throw new Error(`Duplicated file: file hash is similar to file ${simFile} hash with a score of ${dupScore}` )
    }
}


/**
 * Check is a piece of code is complex or not
 * A code is considered complex if it:
 *  * Has a size greater than 1kb
 *  * Has an AST with at least 30 nodes
 *  * Has an AST depth of at least 10 (meaning that there is at least one node with 10 or more descendents in depth)
 * @param {*} input String of code
 * @param {*} fileSize Total size of the file
 * @param {*} depthThreshold Thershold for the ast minimum depth
 * @param {*} nodeThreshold Threshold for the ast minimum number of nodes
 * @returns 
 */
function check_code_complexity(input, fileSize, depthThreshold=10, nodeThreshold=30) {


    if(fileSize > globals.MIN_FILE_SIZE)
        return 

    let tree

    try {
        tree = new Ast(input, {next: false})
    } catch (error) {
        return 
    }
    tree.mark()

    
    const node = tree.find({cid: nodeThreshold})
    if (node.length > 0)
        return 

    let maxDepth = 0;
    let parents = {}
    try {
        Ast.walk(tree._tree, (node, parent) => { 

            if (parent === null)
                parents[node.cid] = 0
            else
                parents[node.cid] = parent.cid
            let child = node.cid
            let depth = 0
            while(depth <= depthThreshold){
                const parentCid = parents[child]
                if (parentCid === 0)
                    break;
                else {
                    child = parentCid
                    depth += 1
                }
            }
            maxDepth = Math.max(maxDepth, depth)
            if(maxDepth >= depthThreshold)
                throw new Error("Threshold verified, traversal completed.")   
        })
    } catch (error) {
        return 
    }
    throw new Error(`Simple code: AST has a maximum depth of ${maxDepth} nodes`)
}



/**
 * Return list of all hash values from the files that were previously processed
 */
 function get_processed_files_hash(){
    try {
        const logFileDir = globals.PROCESSED_LOGS_LOG_DIR
        let processedFiles = []
        let logLines = fs.readFileSync(logFileDir).toString().split(globals.LOG_LINE_BREAK);
        logLines.forEach(item => {
            const tokens = item.split(globals.LOG_SEPARATOR)
            if(tokens.length > 0)
                processedFiles.push(tokens[tokens.length - 2]) 
        });
        return processedFiles
    } catch (error) {
        return []
    }
}




module.exports = {
    build_fileId,
    build_destination_dir,
    build_logs_log_data_on_success,
    build_logs_log_data_on_failure,
    write_to_logs_log_file,
    write_to_pre_log_file,
    get_processed_dirs,
    get_start_dir,
    copy_file,
    check_transformed,
    compute_hash,
    check_duplicates,
    check_code_complexity,
    get_processed_files_hash,
    esprima_minify,
    get_similarity_score,
    globals,
    get_processed_files,
}