const fs = require("fs");
const path = require("path");
const { exec } = require('child_process');
require('dotenv-flow').config();


/**
 * Directory to globals file
 */
const GLOBALS_FILE = "./globals/globals.json"

/**
 * Dictionay storing all the global variables
 */
const globals = load_globals()


/**
 * Suffix to label the file as transformed by jscrambler
 */
 const suffix = globals.JSCRAMBLER

/**
 * Access key
 */
const ACCESS_KEY = process.env.ACCESS_KEY;

/**
 * Secret key
 */
const SECRET_KEY = process.env.SECRET_KEY;

/**
 * Application id
 */
const APPLICATION_ID = process.env.APPLICATION_ID;


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
 * Delete file
 * @param {*} fileDir Path to file
 */
function delete_file(fileDir) {
    fs.unlinkSync(fileDir);
}


/**
 * Build ouput path (used to store the ouput of applying a tool to transform a code snippet)
 * @param {*} fileId Id of file transformed
 * @param {*} outputDir Path to ouput directory
 * @param {*} suffix Label to identify the tool used
 * @param {*} configNr Configuration file 
 * @param {*} withSuffix Boolean to check if an intermediate folder with the suffix name should be created
 */
function build_output_dir(fileId, outputDir, suffix, configNr, withSuffix = true) {
    if(withSuffix)
        return outputDir + globals.DIR_SEPARATOR + suffix + globals.DIR_SEPARATOR + fileId + globals.DEFAULT_SEPARATOR + suffix + globals.DEFAULT_SEPARATOR + configNr + globals.OUTPUT_FILE_EXTENSION;
    return outputDir + globals.DIR_SEPARATOR + fileId + globals.DEFAULT_SEPARATOR + suffix + globals.DEFAULT_SEPARATOR + configNr + globals.OUTPUT_FILE_EXTENSION;

}


/**
 * Build and format log data in case of successful operation
 * @param {*} fileId Id of file trasformed
 */
function build_log_data_on_success(fileId){
    const currDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    return "LOG - " + fileId + globals.LOG_SEPARATOR + currDate + globals.LOG_SEPARATOR + globals.LOG_SUCCESS + " - ENDLOG" + globals.LOG_LINE_BREAK;
}


/**
 * Build and format log data in case of failed operation
 * @param {*} fileId Id of file transformed
 * @param {*} error Error message
 */
function build_log_data_on_failure(fileId, error = globals.DEFAULT_ERROR){
    const currDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    return "LOG - " + fileId + globals.LOG_SEPARATOR + currDate + globals.LOG_SEPARATOR + globals.LOG_FAILURE + globals.LOG_LINE_BREAK +  globals.LOG_LINE_INDENTATION + error + " - ENDLOG" + globals.LOG_LINE_BREAK;
}


/**
 * Write data to specified tool log file
 * @param {*} suffix Label to identify the tool used
 * @param {*} data Data to write to the log file
 * @param {*} configFile Configuration file (name + extension) used
 */
function write_to_log_file(suffix, data, configNr){
    const logFileDir = globals.TOOLS_LOG_DIR + suffix + globals.DEFAULT_SEPARATOR + configNr + globals.LOG_FILE_EXTENSION;
    fs.appendFile(logFileDir, data, function (err) {
        if (err) throw err;
    });
}


/**
 * Get the names of all files in a directory
 * @param {*} directory Directory to traverse
 * @param {*} files List of files that will be returned
 * @param {*} excludeFiles Files to exclude from the final list
 */
function get_files_in_directory(directory, files, excludeFiles=[]){

     fs.readdirSync(directory).forEach(file => {
        const absolute = path.join(directory, file);
        const stats = fs.statSync(absolute);
        if (stats.isDirectory()) return get_files_in_directory(absolute, files);
        else {
            if(excludeFiles.includes(file))
                return
            files.push(absolute)
        }
    });
}


/**
 * Return configuration file name from file
 * @param {*} configFile Configuration file
 */
 function get_config_name(configFile) {
    return path.basename(configFile, globals.DEFAULT_CONFIG_EXTENSION)
}


/**
 * Return list of all the files that were previously transformed
 * @param {*} suffix label of the tool
 * @param {*} configFile Config file used
 * @returns 
 */
function get_log_file_dir(suffix, configFile = globals.DEFAULT_CONFIG_FILE){
    const configNr = get_config_name(configFile);
    return globals.TOOLS_LOG_DIR + suffix + globals.DEFAULT_SEPARATOR + configNr + globals.LOG_FILE_EXTENSION;
}


/**
 * Return list of all the files that were previously transformed
 */
 function get_transformed_files(configFile){
    try {
        const logFileDir = get_log_file_dir(suffix, configFile)
        let transformedFiles = []
        let logLines = fs.readFileSync(logFileDir).toString().split(globals.LOG_LINE_BREAK);
        logLines.forEach(item => {
            const tokens = item.split(globals.LOG_SEPARATOR)
            if(tokens.length > 0)
                transformedFiles.push(tokens[1] + globals.INPUT_FILE_EXTENSION) 
        });
        return transformedFiles
    } catch (error) {
        console.log(error)
        return []
    }
}


/**
 * Copy file from global input directory to local input directory (required)
 * @param {*} fileToTransform File to be copied
 */
function copy_file_to_local_input(fileToTransform){
    const file = "./" + fileToTransform;
    const fileName = path.basename(fileToTransform)
    const copy = globals.JSCRAMBLER_LOCAL_INPUT_DIR + globals.DIR_SEPARATOR + fileName
    copy_file(file, copy);
    return copy;
}



 /**
 * Transform each file individually with a specified configuration
 * - copy file to local input directory
 * - call ./transform.sh script to transform the code (calls jscrambler)
 * - if successful copy output from local directory
 * - delete file from local input directory
 * - call itself with the next file
 * @param {*} index Index of the file to transform in the filesToTransform list
 * @param {*} filesToTransform List of files to be transformed
 * @param {*} configFile Configuration file
 * @param {*} outputDir Output directory
 * @param {*} timeout Max time the child process (responsible for obfuscating the file) can run
 * @param {*} step Increment (to the next file)
 */
function transform_recursive(index, filesToTransform, configFile, outputDir, timeout, step) {
    
    if(index >= filesToTransform.length)
        return;

    cf = configFile

    const inputFile = copy_file_to_local_input(filesToTransform[index])


    const fileId = path.basename(inputFile, globals.INPUT_FILE_EXTENSION)
    const configNr = get_config_name(cf)
    const outputFile = build_output_dir(fileId, globals.JSCRAMBLER_LOCAL_OUTPUT_DIR, suffix, configNr, false)
    const cmd = `./transform.sh ${ACCESS_KEY} ${SECRET_KEY} ${APPLICATION_ID} ${cf} ${outputFile} ${inputFile}`
    
    exec(cmd, {timeout: timeout},
        (error, stdout, stderr) => {
            let logData;
            if (error === null) {
                const fileDir = build_output_dir(fileId, outputDir, suffix, configNr)
                copy_file(outputFile, fileDir)
                delete_file(outputFile)
                logData = build_log_data_on_success(fileId)
                write_to_log_file(suffix, logData, configNr)
            }
            else {
                logData = build_log_data_on_failure(fileId, "Command failed.")
                write_to_log_file(suffix, logData, configNr)
            }
            delete_file(inputFile)
            transform_recursive(index+step, filesToTransform, configFile, outputDir, timeout, step)
    });
}



/**
 * Transform each file of a directory with a specified configuration
 * @param {*} directory Directory of files
 * @param {*} configFile Configuration file to use
 * @param {*} step Increment
 * @param {*} outputDir Output directory
 */
function transform(directory, configFile, step, outputDir = globals.OBFUSCATED_OUTPUT_DIR){
    let filesToTransform = []

    const transformedFiles = get_transformed_files(configFile)


    get_files_in_directory(directory,filesToTransform, transformedFiles)

    for (let i = 0; i < step; i++) {
        transform_recursive(i, filesToTransform, configFile, outputDir, globals.TIMEOUT, step);
    }
}


const args = process.argv.slice(2);
const configFile = globals.JSCRAMBLER_CONFIGS_DIR + args[0]
transform(globals.TRANSFORM_INPUT_DIR, configFile, 1);



