const jsObfuscator = require('js-obfuscator');
const Utils = require("../../../utils")
const fs = require("fs");

/**
 * Directory for the configuration files
 */
const configDir = "./tools/obfuscators/js-obfuscator/configurations/" ;

 /**
 * Obfuscate a given code snippet with the js-obfuscator obfuscator. Stores the ouput in another file.
 * @param {*} input Code snippet to be transformed
 * @param {*} configFile Configuration files
 */
async function transform(input, configFile, fileId, suffix, outputDir){
    const config = Utils.load_config(configDir, configFile);
    await jsObfuscator(input, config).then(function(obfuscated) {
        //console.log(obfuscated)
        const fileDir = Utils.build_output_dir(fileId, outputDir, suffix, configFile);
        if(obfuscated == "undefined")
        {
            console.error("undefined")
        } else {
            Utils.store(fileDir, obfuscated); 
            console.log(fileDir)
        }
        }, function(error) {
            console.error(error)
        });
}
 


const args = process.argv.slice(2);
const file = args[0]
const configFile = args[1]
const suffix = args[2]
const outputDir = args[3]
const input = fs.readFileSync(file, "utf-8");
const fileId = Utils.get_fileId(file);
transform(input, configFile, fileId, suffix, outputDir)