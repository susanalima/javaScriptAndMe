const JSFuck = require('jsfuck').JSFuck
const fs = require("fs");
const Utils = require("../../../utils")

 /**
 * Obfuscate a given code snippet with the jsfuck obfuscator. Stores the ouput in another file.
 * @param {*} input Code snippet to be transformed
 * @param {*} configFile Configuration file (not used in this case)
 */
function transform(input, configFile, fileId, suffix, outputDir) {
    try {
        const output = JSFuck.encode(input, true, true)
        //console.log(output)
        const fileDir = Utils.build_output_dir(fileId, outputDir, suffix, configFile);
        Utils.store(fileDir, output);
        console.log(fileDir)
    } catch (error) {
        console.error(error)
    }
}


const args = process.argv.slice(2);
const file = args[0]
const configFile = args[1]
const suffix = args[2]
const outputDir = args[3]

var stats = fs.statSync(file)
var fileSize = stats.size / 1024

if(fileSize > 10){
    console.error("File to big: " + fileSize + " kb")
}
else {
    const input = fs.readFileSync(file, "utf-8");
    const fileId = Utils.get_fileId(file);
    transform(input, configFile, fileId, suffix, outputDir)
}

