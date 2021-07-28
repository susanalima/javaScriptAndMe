const ClosureCompiler = require('google-closure-compiler').compiler

const Utils = require("../../../utils")

/**
 * Suffix to label the file as transformed by Google Closure Compiler
 */
//const suffix = Utils.globals.GOOGLE_CLOSURE_COMPILER


 /**
 * Minify a given code snippet with the Google Closure Compiler minifier. Stores the ouput in another file.
 * @param {*} inputFile File with the code to be transformed
 * @param {*} fileId Id of the file containing the code
 * @param {*} configFile Configuration file (not used in this case)
 * @param {*} outputDir Output to store the transformed code
 */
function transform(inputFile, fileId, suffix, configFile = Utils.globals.DEFAULT_CONFIG_FILE, outputDir = Utils.globals.MINIFIED_OUTPUT_DIR) {
    
    const outputFile = Utils.build_output_dir(fileId, outputDir, suffix);

    const closureCompiler = new ClosureCompiler({
        js: inputFile,
        js_output_file: outputFile,
      });
    const promise  = closureCompiler.run((exitCode, stdOut, error) => {
        if (exitCode !== 0) {
            console.error(error)
        } else {
            console.log("0")
        } 
    });

}


const args = process.argv.slice(2);
const file = args[0]
const configFile = args[1]
const fileId = Utils.get_fileId(file);
const suffix = args[2]
transform(file, fileId, suffix, configFile)