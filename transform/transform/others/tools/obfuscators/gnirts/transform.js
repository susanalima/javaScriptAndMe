const gnirts = require('gnirts')
const Utils = require("../../../utils")
const fs = require("fs");
const StripComments = require('strip-comments');


/**
 * Indicates the beginning of the obfuscation
 */
const OPEN_MANGLE = "/* @mangle */ ";
/**
 * Indicates the ending of the obfuscation
 */
const CLOSE_MANGLE = " /* @/mangle */";

/**
 * No strings were found error message
 */
const NO_MATCH_ERROR_MESSAGE = "No matches: there are no strings in the code to transform.";

/**
 * Insufficient strings were found error message
 */
const INSUFFICIENT_ERROR_MESSAGE = "Insufficient matches: there are not enough strings in the code to transform.";

/**
 * Indicates that in each kb of a file there must be two strings to obfuscate
 */
const MULTIPLIER = 2;

/**
 * Wrap a string with with OPEN_MANGLE and CLOSE_MANGLE
 * @param {*} match Regex match: "string content"
 * @param {*} p1 Regex first group: "
 * @param {*} p2 Regex second group: string content
 * @param {*} p3 Regex third group: "
 * @param {*} offset ...
 * @param {*} string ...
 */
function replacer_string(match, p1, p2, p3, offset, string) {
    return OPEN_MANGLE + p1 + p2 + p3 + CLOSE_MANGLE;
}

/**
 * Wrap all strings in code snippet with OPEN_MANGLE and CLOSE_MANGLE to indicate that that string must be obfuscated.
 * If there are not enough strings (nr >= fileSize * MULTIPLIER) to generate an obfuscated file and error is raised.
 * Something is a string if is wrapped around a " or a '.
 * @param {*} input Code snippet
 * @param {*} fileSize Code file size
 */
function pre_process_string(input, fileSize) {
    const regexQM = /(\")(.+?)(\")/g;
    const regexQ =  /(\')(.+?)(\')/g;
    const regexA =  /(\`)((.|\n)+?)(\`)/g;

    try {
        inputNC = StripComments(input)
    } catch (error) {
        
    }
    let count = (inputNC.match(regexA) || []).length;
    count += (inputNC.match(regexQ) || []).length;
    count += (inputNC.match(regexQM) || []).length;
    if(count === 0){
        throw new Error(NO_MATCH_ERROR_MESSAGE)
    }
    if(count < fileSize * MULTIPLIER){
        throw new Error(INSUFFICIENT_ERROR_MESSAGE)
    }

    let processedInput = input.replace(regexA, replacer_string);
    processedInput = processedInput.replace(regexQM, replacer_string);
    processedInput = processedInput.replace(regexQ, replacer_string);

    return processedInput;
}


 /**
 * Obfuscate a given code snippet with the gnirts obfuscator. Stores the ouput in another file.
 * @param {*} input Code snippet to be transformed
 * @param {*} configFile Configuration file (not used in this case)
 * @param {*} fileSize Size of the file of code in kb
 */
function transform(input, configFile,  fileId, suffix, outputDir, fileSize) {
    try {
        const processedInput = pre_process_string(input, fileSize);
        const output = gnirts.mangle(processedInput);
        //console.log(output)
        const fileDir = Utils.build_output_dir(fileId, outputDir, suffix, configFile);
        Utils.store(fileDir, output); 
        console.log(fileDir)
    } catch (error) {
        console.error(error);
    }  
}


const args = process.argv.slice(2);
const file = args[0]
const configFile = args[1]
const suffix = args[2]
const outputDir = args[3]
const input = fs.readFileSync(file, "utf-8");
const stats = fs.statSync(file)
const fileSize = stats.size/ Utils.globals.BYTE_TO_KILOBYTE
const fileId = Utils.get_fileId(file);
transform(input, configFile,  fileId, suffix, outputDir, fileSize)