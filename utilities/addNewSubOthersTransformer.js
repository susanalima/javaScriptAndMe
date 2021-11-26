
var fs = require('fs');


try {
    const args = process.argv.slice(2);
    let type = args[0];
    let name = args[1];
    var dir = `./transform/transform/others/tools/${type}/${name}`;
    // create folder for code
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);

        let transformCode = `
const fs = require("fs");
const Utils = require("../../../utils")


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
            `
        
            fs.writeFile(`./collect/${name}/Dockerfile`, transformCode, function (err) {
                if (err) throw err;
            });
    }




    //update init script
    fs.appendFile('./transform/scripts/init.sh', `\nmkdir -p -- "./output/${type}/${name}"`, function (err) {
        if (err) throw err;
    });

    // update output
    if (fs.existsSync(`./transform/output`)){
        fs.mkdirSync(`./transform/output/${type}/${name}`, {recursive: true});
    }
} catch (error) {   
    console.log("Failed to add new sub collector")
}

