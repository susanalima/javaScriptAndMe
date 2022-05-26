import os
import utils


""" Dictionay storing all the global variables """
globals_ = utils.load_globals()

"""" Suffix to label the file as transformed by javaScript2img """
SUFFIX = globals_['JAVASCRIPT2IMG']

""" Path to ouput directory """
OUTPUT_DIR = utils.build_output_dir(SUFFIX)


def go_back(driver):
    """ Go back to initial page (after obfuscating the page is redirected)

    Args:
        driver (webdriver) : driver used for scrapping the site
    """
    driver.get(globals_['JS2IMG_URL'])


def transform(driver, input, fileId):
    """ Transform code by scrapping the JavaSript2img site

    Args:
        driver (webdriver): browser for scrapping the site
        input (str): content to be transformed (code)
        fileId (str): id of file to be transformed
    
    Returns:
        boolean: True if input is successfully transformed, False otherwise
    """

    logFileDir = utils.get_log_file_dir(SUFFIX)
    outputFileDir = OUTPUT_DIR + fileId + globals_['DEFAULT_SEPARATOR'] + SUFFIX + globals_['DEFAULT_SEPARATOR']   +  globals_['DEFAULT_CONFIG'] + globals_['OUTPUT_FILE_EXTENSION']
    try:
        utils.send_input(driver, input, globals_['JS2IMG_INPUT_TA_XPATH'], globals_['JS2IMG_OBFUSCATE_BTN_XPATH'])
        utils.wait(2)
        output = utils.get_output(driver, globals_['JS2IMG_OUTPUT_TA_XPATH'])
        utils.write_to_file(outputFileDir, output)
        utils.wait()
        utils.write_to_log_on_success(fileId, logFileDir)
        go_back(driver)
        return True
    except Exception as e:
        utils.write_to_log_on_failure(fileId, logFileDir, str(e))
        return False
    except ValueError as e:
        utils.write_to_log_on_failure(fileId, logFileDir, str(e))
        return False


def transform_input(directory, transformedFiles):
    """ Transform all files in a given directory with the JavaScript2img obfuscator (by scrapping the site: http://javascript2img.com/)

    Args:
        directory (str): given directory (contains js files to be transformed)
        transformedFiles (list) : list of files that were previously transformed
    """

    driver = utils.setup_driver(globals_['JS2IMG_URL'])
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
                    driver = utils.setup_driver(globals_['JS2IMG_URL'])
                    failCount += 1
                else:
                    failCount = 0
                utils.wait(globals_['INBETWEEN_WAITING_TIME']) 

    driver.quit()
