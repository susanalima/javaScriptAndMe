import re

def get_sources():
    """ Get list of modules to install
    
    """

    filename = "./input/npmsToDownloadRaw.md"
    with open(filename) as f:
        data = f.read()
        
    matches = re.findall(r"\[(.*)\]", data)

    outputFile = "./input/npmsToDownload.txt"
    with open(outputFile,'a') as f:
        for match in matches:
            f.write(match + "\n")
