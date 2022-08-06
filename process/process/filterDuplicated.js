const fs = require("fs");
const path = require("path");
const Utils = require("./utils")
const { exec } = require('child_process');

const globals = Utils.globals

/**
 * Process file (renames the file with unique id and copies it to ../input/toTransform directory)
 * @param {*} fileDir  File to process
 * @param {*} fileSize Size of the file
 * @param {*} hash Hash value of the file
 * @param {*} folder Name of subfolder
 */
function process_input(fileDir, fileSize, hash, folder){
    const destinationDir = Utils.build_destination_dir(fileDir, folder);
    let logData = "";
    try {
        if(fileSize * globals.BYTE_TO_KILOBYTE < 1)
            throw new Error("File smaller than 1 byte" )
        Utils.copy_file(fileDir, destinationDir);
        logData = Utils.build_logs_log_data_on_success(fileDir, destinationDir, fileSize, hash);
        Utils.write_to_logs_log_file(logData)
    } catch (error) {
        logData = Utils.build_logs_log_data_on_failure(fileDir, destinationDir, error);
        Utils.write_to_logs_log_file(logData)        
    }
}

/**
 * filter duplicated files in a given list
 * @param {*} filesToProcess List of files to be processed
 * @param {*} hashFiles List containing the hash values for the processed files
 * @param {*} threshold value for the maximum duplicated score value accepted
 * @param {*} processedFiles List containing the files already processed
 */
function filterDuplicated(filesToProcess, hashFiles, threshold, processedFiles){

    filesToProcess = filesToProcess.reverse()
    hashFiles = hashFiles.reverse()

    for (let index = 0; index < filesToProcess.length; index++) {
        const file = filesToProcess[index]
        const hash = hashFiles[index]
        if(!processedFiles.includes(file)){
            console.log(file)
            try {
                if(index < filesToProcess.length - 1)
                    Utils.check_duplicates(hash, hashFiles.slice(index+1, hashFiles.length), filesToProcess.slice(index+1, filesToProcess.lengths),threshold)
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
 * Get files to be filter (minified)
 * @param {*} directory Given directory
 * @param {*} filesToProcess List containing all the files to be processed
 * @param {*} processedDirs List containing the directories previously processed
 * @param {*} processedFiles List containing the files already processed
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


/**
 * Process each file in the filesToProcess list
 * @param {*} index Given directory
 * @param {*} filesToProcess List containing all the files to be processed
 * @param {*} step Increment (to the next file)
 * @param {*} timeout Max time the child process (responsible for processing the file) can run
 */
function filterMinified_exec(index, filesToProcess, step, timeout) {
            
    if(index >= filesToProcess.length)
        return


    const file = filesToProcess[index]
    const cmd = `node ./filterMinified.js ${file}`

    exec(cmd, {timeout: timeout},
        (error, stdout, stderr) => { 
            if (error !== null) { //exec failed
                const logData = Utils.build_logs_log_data_on_failure(file, "unknown", "unknown", error);
                Utils.write_to_logs_log_file(logData)          
            }
            filterMinified_exec(index+step, filesToProcess, step, timeout)
        });
}


/**
 * Process all files in a given directory and stores them in ./input/toTransform
 * The files are stored in folders of MAX_FILES_PER_DIR (3000) files
 * @param {*} directory input directory
 * @param {*} folder input folder
 * @param {*} processedFiles files already processed
 * @param {*} step Increment (to the next file)
 */
function filterMinified(directory, folder, processedFiles, step=5){
    const processedDirs = Utils.get_processed_dirs();
    const dir = directory + folder
    let filesToProcess = []
    get_files_to_process( dir, filesToProcess, processedDirs, processedFiles)
    for (let i = 0; i < step; i++) {
        filterMinified_exec(i, filesToProcess, step, 5*60000)
    }
}





try {
    const args = process.argv.slice(2);
    const firstOption = args[0]

    let logs

    try {
        logs = fs.readFileSync("./logs/logs.txt", "utf-8").split("\n")
        logs = logs.slice(0, logs.length - 1)
    } catch (error) {
        logs = []
    }

    const processedFiles = logs.map(function(e) {
        const tokens = e.split(" - ") 
        if(tokens[0] === globals.LOG_HEADER)
            return tokens[1]
    });

    let preLogs
    try {
        preLogs = fs.readFileSync("./logs/pre_logs.txt", "utf-8").split("\n")  
        preLogs = preLogs.slice(0, preLogs.length - 1)
    } catch (error) {
        preLogs = []
    }

        
    const filteredFiles = preLogs.map(function(e) { 
        return e.split(" - ")[0]
    });



    if (firstOption === "minified"){
        let inputFolder = args[1]
        if(inputFolder === "Default")
            inputFolder=""
        
        const excludeFiles = processedFiles.concat(filteredFiles)
        filterMinified(globals.PROCESS_INPUT_DIR, inputFolder, excludeFiles)

    } else {
        if (firstOption === "duplicated") {

            const hashFiles = preLogs.map(function(e) { 
                return e.split(" - ")[1]
            });

            if (args[1] === "Default")
                args[1] = "40"
            

            filterDuplicated(filteredFiles, hashFiles, args[1], processedFiles)
        }
        else {
            console.log("Unknown option. Should use \"minified\" or \"duplicated\"")
        }
    }


} catch (error) {   
    console.log(error)
}



