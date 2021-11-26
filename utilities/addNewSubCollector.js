
var fs = require('fs');


let name=""
try {
    const args = process.argv.slice(2);
    name = args[0];
    var dir = `./collect/${name}`;
    // create folder for code
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);

        //create dockerfile
        fs.writeFile(`./collect/${name}/Dockerfile`, `FROM ubuntu:latest\nWORKDIR /app`, function (err) {
            if (err) throw err;
        });

        //create build.sh
        fs.writeFile(`./collect/${name}/build.sh`, `docker build --tag collect_${name} . `, function (err) {
            if (err) throw err;
        });

        //create run.sh
        fs.writeFile(`./collect/${name}/run.sh`, `#!/bin/bash
COLLECT_OPTION=${'${1:-"code"}'}
NUMBER_REPOS=${'${2:-"1000"}'}
SOURCE=${'${3:-"extensions"}'}
START_AT=${'${4:-"1"}'}

MOUNT_FOLDER=${'${PWD%/*}'};
INPUT="$MOUNT_FOLDER/input"
LOGS="$MOUNT_FOLDER/logs"
OUTPUT="$MOUNT_FOLDER/output"
GLOBALS="$MOUNT_FOLDER/globals"

docker run -v $INPUT:/app/input \
-v $LOGS:/app/logs \
-v $OUTPUT:/app/output \
-v $GLOBALS:/app/globals \
collect_${name} /bin/bash -c ""
        `, function (err) {
            if (err) throw err;
        });
    }

    //update init script
    fs.appendFile('./collect/scripts/init.sh', `\nmkdir -p -- "./logs/${name}"\nmkdir -p -- "./output/${name}"`, function (err) {
        if (err) throw err;
    });
    // update logs
    if (fs.existsSync(`./collect/logs`)){
        fs.mkdirSync(`./collect/logs/${name}`);
    }
    // update output
    if (fs.existsSync(`./collect/output`)){
        fs.mkdirSync(`./collect/output/${name}`);
    }
} catch (error) {   
    console.log("Failed to add new sub collector")
}

