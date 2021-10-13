import re
import os

def get_sources(number_modules):
    """ Get list of modules to install
    
    """

    filename = "./input/npmsToDownloadRaw.md"
    with open(filename) as f:
        data = f.read()
        
    matches = re.findall(r"\[(.*)\]", data)

    outputFile = "./input/npmsToDownload.txt"


    if not os.path.exists(outputFile):
        open(outputFile,"w+")

    with open(outputFile,'a') as f:
        counter = 0
        for match in matches:
            f.write(match + "\n")
            counter += 1
            if counter >= number_modules:
                break
