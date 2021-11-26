import os
import utils

# NOTES


# add to ../../../globals/globals.json the following entries:
# * "BENCHMARK": name of the tool
# * "BENCHMARK_URL": url to visit

# replace globals_['BENCHMARK'] by the correct entry
# replace globals_['BENCHMARK_URL'] by the correct entry

# add a condition to ../transform.py to accomodate the new tool and call the transform_input function

""" Dictionay storing all the global variables """
globals_ = utils.load_globals()

"""" Suffix to label the file as transformed by BENCHMARK """
SUFFIX = globals_['BENCHMARK']

""" Path to ouput directory """
OUTPUT_DIR = utils.build_output_dir(SUFFIX)



def transform(driver, input, fileId):
    """ Transform code by scrapping the JavaSript2img site

    Args:
        driver (webdriver): Browser for scrapping the site
        input (str): Content to be transformed (code)
        fileId (str): Id of file to be transformed
    
    Returns:
        boolean: True if input is successfully transformed, False otherwise
    """

    # ADD CODE HERE



def transform_input(directory, transformedFiles):
    """ Transform all files in a given directory with the JavaScript2img obfuscator (by scrapping the site: http://javascript2img.com/)

    Args:
        directory (str): Given directory (contains js files to be transformed)
        processedFiles (list) : List of files that were previously transformed
    """

    driver = utils.setup_driver(globals_['BENCHMARK_URL'])
    utils.wait(2)

    failCount = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            fileInputDir = os.path.join(root, file)
            if file not in transformedFiles:
                input = utils.read_from_file(fileInputDir)
                fileId = utils.get_file_id(file)
                success = transform(driver, input, fileId)
                if not success:
                    if failCount > 4:
                        break
                    driver.quit()
                    driver = utils.setup_driver(globals_['BENCHMARK_URL'])
                    failCount += 1
                else:
                    failCount = 0
                utils.wait(globals_['INBETWEEN_WAITING_TIME']) 

    driver.quit()
