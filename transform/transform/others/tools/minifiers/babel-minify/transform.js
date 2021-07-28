const minify = require("babel-minify");
const fs = require("fs");
const Utils = require("../../../utils")

/**
 * Minify a given code snippet with the babel-minify minifier. Stores the ouput in another file.
 * @param {*} input Code snippet to be transformed
 * @param {*} configFile Configuration file (not used in this case)
 */
function transform(input, configFile, fileId, suffix, outputDir) {
  const options = {
    mangle: {
      keepClassName: true
    }
  }
  try {
      const {code} = minify(input, options);
      //console.log(code)
      const fileDir = Utils.build_output_dir(fileId, outputDir, suffix, configFile);
      Utils.store(fileDir, code);
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