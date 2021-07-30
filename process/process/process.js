const fs = require("fs");
const path = require("path");
const Utils = require("./utils")
const { exec } = require('child_process');
const FilterObfuscation = require("./filterObfuscation")

const globals = Utils.globals

/**
 * Process file (renames the file with unique id and copies it to ../input/toTransform directory)
 * @param {*} fileDir  File to process
 * @param {*} fileSize Size of the file
 * @param {*} hash Hash value of the file
 * @param {*} nrFiles Name of subfolder
 */
function process_input(fileDir, fileSize, hash, folder){
    const destinationDir = Utils.build_destination_dir(fileDir, folder);
    let logData = "";
    try {
        Utils.copy_file(fileDir, destinationDir);
        logData = Utils.build_logs_log_data_on_success(fileDir, destinationDir, fileSize, hash);
        Utils.write_to_logs_log_file(logData)
    } catch (error) {
        logData = Utils.build_logs_log_data_on_failure(fileDir, destinationDir, error);
        Utils.write_to_logs_log_file(logData)        
    }
}

/**
 * Process all files in a given list
 * @param {*} filesToProcess List of files to be processed
 * @param {*} startDir First directory number to store the processed files
 * @param {*} hashFiles List containing the hash values for the processed files
 */
function process_files(filesToProcess, hashFiles, threshold, processedFiles){

    filesToProcess = filesToProcess.reverse()
    hashFiles = hashFiles.reverse()

    for (let index = 0; index < filesToProcess.length; index++) {
        const file = filesToProcess[index]
        const hash = hashFiles[index]
        if(!processedFiles.includes(file)){
            try {
                if(index < filesToProcess.length - 1)
                    Utils.check_duplicates(hash, hashFiles.slice(index+1, hashFiles.length-1), filesToProcess.slice(index+1, filesToProcess.length-1),threshold)
                const stats = fs.statSync(file);
                const fileSize = stats.size / globals.BYTE_TO_KILOBYTE;
                process_input(file, fileSize, hash, "")
            } catch (error) {
                const logData = Utils.build_logs_log_data_on_failure(file, "unknown", hash, error);
                Utils.write_to_logs_log_file(logData)          
            }
        }
    }
}


/**
 * Store all suitable files in given directory in a list and filter the remaining files
 * A file is considered suitable if
 * * it is not transformed (obfuscated or minified)
 * * it is not a duplicate
 * * it is complex enough
 * * it can be parsed
 * If the directry was previously processed it is not processed again.
 * @param {*} directory Given directory
 * @param {*} filesToProcess List containing all the files to be processed
 * @param {*} filteredFiles List containing the files filtered
 * @param {*} hashFiles List containing the hash values for the processed files
 * @param {*} processedDirs List containing the directories previously processed
 */
function get_files_to_process(directory, filesToProcess, processedDirs, processedFiles){

    if(processedDirs.includes(directory))
        return 

    fs.readdirSync(directory).forEach(file => {
        const absolute = path.join(directory, file);
        let stats
        try{
             stats = fs.statSync(absolute);
        }
        catch{
            return
        }
        if (stats.isDirectory()) {
            if(path.basename(absolute) === "locales")
                return
            return get_files_to_process(absolute, filesToProcess, processedDirs, processedFiles);
        }
        else {
            if(processedFiles.includes(absolute))
                return
            const fileExtension = path.extname(absolute)
            if (fileExtension !== globals.INPUT_FILE_EXTENSION)
                return
            filesToProcess.push(absolute)  
        }
    });
}


function process_exec(index, filesToProcess, step, timeout) {
            
    if(index >= filesToProcess.length)
        return


    const file = filesToProcess[index]
    const cmd = `node ./filter.js ${file}`

    exec(cmd, {timeout: timeout},
        (error, stdout, stderr) => { 
            if (error !== null) { //exec failed
                const logData = Utils.build_logs_log_data_on_failure(file, "unknown", "unknown", error);
                Utils.write_to_logs_log_file(logData)          
            }
            process_exec(index+step, filesToProcess, step, timeout)
        });
}


/**
 * Process all files in a given directory and stores them in ./input/toTransform
 * The files are stored in folders of MAX_FILES_PER_DIR (3000) files
 */
function filter(directory, folder, processedFiles, step=5){
    const processedDirs = Utils.get_processed_dirs();
    const dir = directory + folder
    let filesToProcess = []
    get_files_to_process( dir, filesToProcess, processedDirs, processedFiles)
    for (let i = 0; i < step; i++) {
        process_exec(i, filesToProcess, step, 5*60000)
    }
}


try {
    const args = process.argv.slice(2);
    const firstOption = args[0]

    if (firstOption === "filter-obfuscation"){
        let inputFolder = args[1]
        FilterObfuscation.filter(inputFolder)
    } else {

        let logs

        try {
            logs = fs.readFileSync("./logs/process/logs.txt", "utf-8").split("\n")
            logs = logs.slice(0, logs.length - 1)

        } catch (error) {
            logs = []
        }

        const processedFiles = logs.map(function(e) {
            const tokens = e.split(" - ") 
            if(tokens[0] === "LOG")
                return tokens[1]
        });

        let preLogs
        try {
            preLogs = fs.readFileSync("./logs/process/pre_logs.txt", "utf-8").split("\n")  
            preLogs = preLogs.slice(0, preLogs.length - 1)
        } catch (error) {
            preLogs = []
        }

            
        const filteredFiles = preLogs.map(function(e) { 
            return e.split(" - ")[0]
        });


        if (firstOption === "filter"){
            let inputFolder = args[1]
            if(inputFolder === "Default")
                inputFolder=""
            
            const excludeFiles = processedFiles.concat(filteredFiles)
            filter(globals.PROCESS_INPUT_DIR, inputFolder, excludeFiles)

        } else {
            if (firstOption === "process") {

                const hashFiles = preLogs.map(function(e) { 
                    return e.split(" - ")[1]
                });

                process_files(filteredFiles, hashFiles, args[1], processedFiles)
            }
        }
    }

} catch (error) {   
    console.log(error)
}



