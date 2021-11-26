const fs = require("fs");
const Utils = require("../../../utils")

/**
 * must add to  ../../../../../globals/globals.json the following entries:
 * "BENCHMARK": name of the tool
 *  Append to the "MINIFIERS" array the name of the new tool 
 * 
 */

/**
 * Minify a given code snippet with the BENCHMARK minifier. Stores the ouput in another file.
 * @param {*} input Code snippet to be transformed
 * @param {*} configFile Configuration file (not used in this case)
 */
function transform(input, configFile, fileId, suffix, outputDir) {
    // transform code
}


const args = process.argv.slice(2);
const file = args[0]
const configFile = args[1]
const suffix = args[2]
const outputDir = args[3]
const input = fs.readFileSync(file, "utf-8");
const fileId = Utils.get_fileId(file);
transform(input, configFile, fileId, suffix, outputDir)