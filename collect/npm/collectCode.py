import os
import shutil
import argparse
from collectSources import get_sources
import utils

globals_ = utils.load_globals()


def download_modules(numberModules, startAt):
    """ Download a specified number of modules from a list of modules

    Args:
        numberModules (int): number of modules to download
        startAt (int): start position. Line number in npmsToDownloadRaw.md file to start.

    """

    filename = globals_['COLLECT_NPM_URLS_TO_VISIT_FILE']

    with open(filename) as f:
        modules = f.read().splitlines()

    count = 1
    pos = 1
    for module in modules:
        if pos < startAt:
            pos += 1
        else:
            if  count > numberModules:
                break
            cmd = "npm install " + module + " --quiet --no-progress"
            try:
                val = os.system(cmd)  
                utils.write_to_log_on_success(module, globals_['COLLECT_NPM_LOG_FILE_DIR'])
                if val != 0:
                    raise Exception('Failed to install module.') 
            except Exception as e:
                utils.write_to_log_on_failure(module, globals_['COLLECT_NPM_LOG_FILE_DIR'],str(e))
            count += 1              

    try:
        outputDir = globals_['COLLECT_NPM_OUTPUT_DIR'] + str(startAt) + "_" + str(numberModules) + "/"
        shutil.copytree("./node_modules", outputDir)
        shutil.rmtree("./node_modules") 
    except Exception:
        return


if __name__ == '__main__':
        
    parser = argparse.ArgumentParser()
    parser.add_argument("--collect_option", type=str)
    parser.add_argument("--number_modules", type=str)
    parser.add_argument("--start_at", type=str)
    args = parser.parse_args()
    
    number_modules = int(args.number_modules)
    start_at = int(args.start_at)

    if(args.collect_option == "code"):
        download_modules(number_modules, start_at)

    if(args.collect_option == "sources"):
        get_sources()

      