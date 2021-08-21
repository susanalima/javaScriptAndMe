const fs = require("fs");
const path = require("path");
const Utils = require("./utils")


/**
 * Store all suitable files in given directory in a list and filter the remaining files
 * A file is considered suitable if
 * * it is not transformed (obfuscated or minified)
 * * it can be parsed
 * If the directry was previously processed it is not processed again.
 * @param {*} input String of code
 * @param {*} absolute Absolute path to input folder
 */
function filterMinified(input, absolute){
    const fileName = path.basename(absolute)
    try {
        Utils.check_transformed(fileName, input)
        const hash = Utils.compute_hash(input, Utils.esprima_minify)
        const logData =  absolute + " - " + hash + "\n"
        Utils.write_to_pre_log_file(logData)
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
    filterMinified(input, absolute)
} catch (error) {   
    console.log("Failed to filter minified files")
}




