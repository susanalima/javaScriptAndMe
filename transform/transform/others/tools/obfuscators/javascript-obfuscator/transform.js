const fs = require("fs");
const JavaScriptObfuscator = require('javascript-obfuscator');
const Utils = require("../../../utils")

/**
 * Directory for the configuration files
 */
const configDir = "./tools/obfuscators/javascript-obfuscator/configurations/" ;

 /**
 * Obfuscate a given code snippet with the javascript-obfuscator obfuscator. Stores the ouput in another file.
 * @param {*} input Code snippet to be transformed
 * @param {*} configFile Configuration file
 */
function transform(input, configFile, fileId, suffix, outputDir) {
    const config = Utils.load_config(configDir, configFile);
    try {
        const obfuscationResult = JavaScriptObfuscator.obfuscate( input, config);
        const output = obfuscationResult.getObfuscatedCode();
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
const input = fs.readFileSync(file, "utf-8");
const fileId = Utils.get_fileId(file);
transform(input, configFile, fileId, suffix, outputDir)