const UglifyJS = require("uglify-js");
const fs = require("fs");
const Utils = require("../../../utils")

 /**
 * Minify a given code snippet with the UglifyJs minifier. Stores the ouput in another file.
 * @param {*} input Code snippet to be transformed
 * @param {*} configFile Configuration file (not used in this case)
 */
function transform(input, configFile, fileId, suffix, outputDir) {
    const output = UglifyJS.minify(input);
    const error = output.error;
    if (error === undefined) {
        //console.log(output.code)
        const fileDir = Utils.build_output_dir(fileId, outputDir, suffix, configFile);
        Utils.store(fileDir, output.code);
        console.log(fileDir)
    } else {
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