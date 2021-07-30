
const { exec } = require('child_process');
const path = require("path");
const Utils = require("../../../utils")
const fs = require("fs")

/**
 * Suffix to label the file as transformed by defendjs
 */
const suffix = Utils.globals.DEFENDJS

/**
 * Build defendjs package.json. Mandatory for transformation
 * @param {*} files Names of the files to transform
 */
function build_package_json(files){
    const data = {
        name: "name",
        defendjs: {
            mainFiles: files
        }
    }
    return data;
}


/**
 * Store data into defendjs package.json. Mandatory for transformation
 * @param {*} data Data to write to file (see build_package_json)
 */
function store_package_json(data){
    Utils.store(Utils.globals.DF_PACKAGE_JSON, JSON.stringify(data));
}


/**
 * Copy file from global input directory to local input directory (required)
 * @param {*} fileToTransform File to be copied
 */
function copy_file_to_local_input(fileToTransform){
    const file = "./" + fileToTransform;
    const fileName = path.basename(file)
    Utils.copy_file(file, Utils.globals.DF_LOCAL_INPUT_DIR + fileName);
    return fileName;
}


/**
 * Transform each file individually with all specified configurations
 * - copy file to local input directory
 * - update package.json with the info of the file 
 * - call ./transform.sh script to transform the code (calls defendjs)
 * - if successful copy output from local directory
 * - delete file from local input directory
 * - call itself with the next file
 * @param {*} index Index of the file to transform in the filesToTransform list
 * @param {*} filesToTransform List of files to be transformed
 * @param {*} nrConfigs Number of congiguration files
 * @param {*} outputDir Outout directory
 */
function transform_exec(filesToTransform, outputDir, configFile, index, timeout) {
    if (index >= filesToTransform.length)
        return


    cf = ""
    if (configFile == "all"){
        cf = Utils.get_random_configuration(suffix)
    } else {
        cf = configFile
    }


    let cmd = ""
    cmd = Utils.globals.DF_CONFIG_DIR + cf

    const file = copy_file_to_local_input(filesToTransform[index])
    const data = build_package_json([file]);
    store_package_json(data)
    const fileId = path.basename(file, Utils.globals.INPUT_FILE_EXTENSION)
    exec(cmd, {timeout: timeout},
        (error, stdout, stderr) => {
            const config = path.basename(cf, ".sh")
            if (error === null) {
                const outputFile = Utils.globals.DF_LOCAL_OUPUT_DIR + config + Utils.globals.DIR_SEPARATOR + file
                const fileDir = Utils.build_output_dir(fileId, outputDir, suffix, cf)
                Utils.copy_file(outputFile, fileDir )
                const stats = fs.statSync(outputFile)
                const fileSize = stats.size / Utils.globals.BYTE_TO_KILOBYTE
                const logData = Utils.build_log_data_on_success(fileId, fileSize)
                Utils.write_to_log_file(suffix, logData, cf)
                Utils.delete_file(outputFile)
            }
            else {
                const logData = Utils.build_log_data_on_failure(fileId, error)
                Utils.write_to_log_file(suffix, logData, cf)
            }
            
            Utils.delete_file(Utils.globals.DF_LOCAL_INPUT_DIR+ file)
            transform_exec(filesToTransform, outputDir, configFile, index+1, timeout)
    }); 
}



/**
 * Transform each file individually with all specified configurations
 * @param {*} filesToTransform List of files to be transformed
 * @param {*} outputDir Output directory
 */
function transform(filesToTransform, configFile, outputDir){
    transform_exec(filesToTransform, outputDir, configFile, 0, 10000)
}

module.exports = {
    transform
}