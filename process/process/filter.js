const fs = require("fs");
const path = require("path");
const Utils = require("./utils")

const globals = Utils.globals


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
function filter(input, absolute){
    const fileName = path.basename(absolute)
    try {
        Utils.check_transformed(fileName, input)
        const hash = Utils.compute_hash(fileName, input, Utils.esprima_minify)
        const logData =  absolute + " - " + hash + "\n"
        Utils.write_to_pre_log_file(logData)
        //console.log(absolute + " - " + hash)
    } catch (error) {
        const logData = Utils.build_logs_log_data_on_failure(absolute, "unknown", "unknown", error);
        Utils.write_to_logs_log_file(logData)  
        return
    }     
}





let absolute=""
try {
    const args = process.argv.slice(2);
    absolute = args[0]
    const input = fs.readFileSync(absolute, "utf-8");
    filter(input, absolute)
} catch (error) {   
    console.log("Failed to filter")
}




