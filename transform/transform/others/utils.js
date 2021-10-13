const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");

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
 * Return fileId/fileName from absolute path
 * @param {*} fileDir Absolute path to file
 */
function get_fileId(fileDir) {
    const tokens = fileDir.split(globals.DIR_SEPARATOR)
    const fileName = tokens[tokens.length - 1].split(".")[0]
    return  fileName;
}


/**
 * Write to data to file
 * @param {*} fileDir Absolute path to file
 * @param {*} data Data to store
 */
function store(fileDir, data) {
    fse.outputFile(fileDir, data, (err) => { 
        if (err) throw err; 
    })
}


/**
 * Delete file
 * @param {*} fileDir Path to file
 */
function delete_file(fileDir) {
    fs.unlinkSync(fileDir);
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
 * Build and format log data in case of successful operation
 * @param {*} fileId Id of file trasformed
 * @param {*} fileSize Size of the transformed file in kb
 */
function build_log_data_on_success(fileId, fileSize){
    const currDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    return globals.LOG_HEADER + globals.LOG_SEPARATOR + fileId + globals.LOG_SEPARATOR + currDate + globals.LOG_SEPARATOR + fileSize + "kb" + globals.LOG_SEPARATOR + globals.LOG_SUCCESS + globals.LOG_SEPARATOR + globals.LOG_TAIL + globals.LOG_LINE_BREAK;
}


/**
 * Build and format log data in case of failed operation
 * @param {*} fileId Id of file transformed
 * @param {*} error Error message
 */
function build_log_data_on_failure(fileId, error = globals.DEFAULT_ERROR){
    const currDate = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    return  globals.LOG_HEADER + globals.LOG_SEPARATOR + fileId + globals.LOG_SEPARATOR + currDate + globals.LOG_SEPARATOR + globals.LOG_FAILURE + globals.LOG_LINE_BREAK +  globals.LOG_LINE_INDENTATION + error + globals.LOG_SEPARATOR + globals.LOG_TAIL + globals.LOG_LINE_BREAK;
}


function get_log_file_dir(suffix, configFile = globals.DEFAULT_CONFIG_FILE){
    const config = get_config_name(configFile);
    return globals.TOOLS_LOG_DIR + suffix + globals.DEFAULT_SEPARATOR + config + globals.LOG_FILE_EXTENSION;
}

/**
 * Write data to specified tool log file
 * @param {*} suffix Label to identify the tool used
 * @param {*} data Data to write to the log file
 * @param {*} configFile Configuration file (name + extension) used
 */
function write_to_log_file(suffix, data, configFile = globals.DEFAULT_CONFIG_FILE ){
    const logFileDir = get_log_file_dir(suffix, configFile)
    fs.appendFileSync(logFileDir, data, function (err) {
        if (err) throw err;
    });
}

/**
 * Return configuration file name from file
 * @param {*} configFile Configuration file
 */
function get_config_name(configFile) {
    return configFile.split(".")[0];
}


/**
 * Build ouput path (used to store the ouput of applying a tool to transform a code snippet)
 * @param {*} fileId Id of file transformed
 * @param {*} outputDir Path to ouput directory
 * @param {*} suffix Label to identify the tool used
 * @param {*} configFile Configuration file
 */
function build_output_dir(fileId, outputDir, suffix, configFile = globals.DEFAULT_CONFIG_FILE) {
    const config = get_config_name(configFile);
    return outputDir + globals.DIR_SEPARATOR + suffix + globals.DIR_SEPARATOR + fileId + globals.DEFAULT_SEPARATOR + suffix + globals.DEFAULT_SEPARATOR + config + globals.OUTPUT_FILE_EXTENSION;
}


/**
 * Read data from specified configuration file
 * @param {*} configDir Configurations directory
 * @param {*} configFile Configuration file being loaded
 */
function load_config(configDir, configFile){
    const fileDir = configDir + configFile;
    const data = fs.readFileSync(fileDir, "utf-8");
    return JSON.parse(data);
}


/**
 * Write data to ../logs/input/transformed/others_transformed.txt
 * @param {*} sourceDir Absolute path to file transformed
 */
function write_to_transformed_log_file(sourceDir){
    const fileName = path.basename(sourceDir)
    const data = fileName + globals.LOG_LINE_BREAK;
    fs.appendFile(globals.OTHERS_TRANSFORMED_LOG_DIR , data, function (err) {
        if (err) throw err;
    });
}






module.exports = {
    get_fileId,
    store, 
    build_output_dir, 
    load_config, 
    write_to_log_file, 
    build_log_data_on_success, 
    build_log_data_on_failure,
    write_to_transformed_log_file,
    copy_file,
    delete_file,
    get_log_file_dir,
    globals,
}
