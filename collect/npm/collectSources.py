import re
import os

def get_sources():
    """ Get list of modules to install
    
    """

    filename = "./input/npmsToDownloadRaw.md"
    with open(filename) as f:
        data = f.read()
        
    matches = re.findall(r"\[(.*)\]", data)

    outputFile = "./input/npmsToDownload.txt"


    if not os.path.exists(outputFile):
        f = open(outputFile,"w+")

    with open(outputFile,'a') as f:
        for match in matches:
            f.write(match + "\n")
