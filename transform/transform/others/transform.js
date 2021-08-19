// node test.js

const fs = require("fs");
const path = require("path");
const Utils = require("./utils")
const { exec } = require('child_process');

const Defendjs = require('./tools/obfuscators/defendjs/transform');


/**
 * Return list of all the files that were previously transformed
 */
function get_transformed_files(suffix, configFile){
    let transformedFiles = []

    try {
        const logFileDir = Utils.get_log_file_dir(suffix, configFile)
        let logLines = fs.readFileSync(logFileDir).toString().split(Utils.globals.LOG_LINE_BREAK);
        logLines.forEach(item => {
            const tokens = item.split(Utils.globals.LOG_SEPARATOR)
            if(tokens.length > 0)
                transformedFiles.push(tokens[1] + Utils.globals.INPUT_FILE_EXTENSION) 
        });
    } catch (error) {
        
    }
    
    return transformedFiles
}


/**
 * Get files in directory to be transformed
 * @param {*} directory Directory with files
 * @param {*} transformedFiles Files previously transformed
 * @param {*} filesToTransform Files to be transformed 
 */
function get_files_to_transform(directory, transformedFiles, filesToTransform){

    fs.readdirSync(directory).forEach(file => {
        const absolute = path.join(directory, file);
        const stats = fs.statSync(absolute);
        if (stats.isDirectory()) return get_files_to_transform(absolute);
        else {
            if(transformedFiles.includes(file))
                return
            filesToTransform.push(absolute)
        }
    });
}


/**
 * Callback if transformation was successful (writes output to file and updates logs)
 * @param {*} fileId Id of file transformed
 * @param {*} outputDir Output directory
 * @param {*} suffix Label of the tool used to transform the file
 * @param {*} configFile Configuration file used to transform the file
 * @param {*} output Output of the transformation
 */
function transformation_successful_callback(fileId, outputDir, suffix, configFile, output){
    const logData = Utils.build_log_data_on_success(fileId, "unknown");
    Utils.write_to_log_file(suffix, logData, configFile);
}


/**
 * Callback if transformation failed (updates logs)
 * @param {*} fileId Id of file transformed
 * @param {*} suffix Label of the tool used to transform the file
 * @param {*} configFile Configuration file used to transform the file
 * @param {*} error Error message
 */
function transformation_failed_callback(fileId, suffix, configFile, error){
    const logData = Utils.build_log_data_on_failure(fileId, error);
    Utils.write_to_log_file(suffix, logData, configFile);
}


/**
 * Transform recursively and with child processes a sequence of files
 * @param {*} cmdBasis Command basis for calling exec
 * @param {*} filesToTransform Files to be transformed
 * @param {*} outputDir Directory of the output
 * @param {*} suffix Label of the tool used to transform
 * @param {*} configFile Configuration file used to transform
 * @param {*} index Index of the current file being transformed
 * @param {*} timeout Timeout time
 * @param {*} step Increase in the filestotransform list for next iteration
 * @returns 
 */
function transform_exec(cmdBasis, filesToTransform, outputDir, suffix, configFile, index, timeout, step=1) {
        
    if(index >= filesToTransform.length)
        return

    cf = configFile

    const file = filesToTransform[index]
    const fileId = Utils.get_fileId(file);
    const cmd = cmdBasis + file + " " + cf + " " + suffix + " " + outputDir

    exec(cmd, {timeout: timeout},
        (error, stdout, stderr) => { 
            if (error === null) { //exec successful
                if(stderr.length === 0){ //transformation successful
                    transformation_successful_callback(fileId, outputDir, suffix, cf, stdout)
                } else { //transformation failed
                    transformation_failed_callback(fileId, suffix, cf, stderr)
                }
            }
            else { //exec failed
                if (suffix === Utils.globals.GOOGLE_CLOSURE_COMPILER && stdout === "0")
                    transformation_successful_callback(fileId, outputDir, suffix, cf, stdout)
                else
                    transformation_failed_callback(fileId, suffix, cf, error)
            }
            transform_exec(cmdBasis, filesToTransform, outputDir, suffix, configFile, index+step, timeout, step)
        });
}


/**
 * Get tool type by its label (minifier or obfuscator)
 * @param {*} suffix Label of the tool
 */
function get_tool_type(suffix){
    if(Utils.globals.MINIFIERS.includes(suffix))
        return "minifiers"
    if(Utils.globals.OBFUSCATORS.includes(suffix))
        return "obfuscators"
    throw new Error("Invalid suffix")
}


/**
 * Transform the files of a giver directory
 * @param {*} directory Directory with the files to be transformed
 * @param {*} suffix Label of the tool to use 
 * @param {*} configFile Configuration file to use
 * @param {*} step Number of execs send at once
 */
function transform_input(directory, suffix, configFile, step=1){
    let toolType
    try {
        toolType = get_tool_type(suffix)
    } catch (error) {
        console.log(error)
        return
    }
    let outputDir
    if(toolType === "minifiers")
        outputDir = Utils.globals.MINIFIED_OUTPUT_DIR
    else 
        outputDir = Utils.globals.OBFUSCATED_OUTPUT_DIR
 
    let filesToTransform = []
    const transformedFiles = get_transformed_files(suffix, configFile)

    get_files_to_transform(directory, transformedFiles, filesToTransform)


    if (suffix === Utils.globals.DEFENDJS){
        Defendjs.transform(filesToTransform, configFile, outputDir, 1)
        return
    }

    let cmdBasis = `node ./tools/${toolType}/${suffix}/transform.js `

    if (suffix === Utils.globals.JSOBFU){
        cmdBasis = `ruby ./tools/${toolType}/${suffix}/transform.rb `
    }

    for (let i = 0; i < step; i++) {
        transform_exec(cmdBasis, filesToTransform, outputDir, suffix, configFile, i, Utils.globals.TIMEOUT, step) 
    }
}


const args = process.argv.slice(2);
const suffix = args[0]
const configFile = args[1]
transform_input(Utils.globals.TRANSFORM_INPUT_DIR, suffix, configFile, 5)



