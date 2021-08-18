import os
import utils



""" Dictionay storing all the global variables """
globals_ = utils.load_globals()

"""" Suffix to label the file as transformed by Daft Logic """
SUFFIX = globals_['DAFT_LOGIC']

""" Path to ouput directory """
OUTPUT_DIR = utils.build_output_dir(SUFFIX)



def concent_data_use(driver):
    """ Accept data use pop up

    Args:
        driver (webdriver): Driver used for scrapping the site
    """

    concentBtn = utils.find_element(driver,globals_['DL_CONCENT_BTN_XPATH'])
    concentBtn.click()


def clear_input_and_output(driver):
    """ Clear input and output text areas
        * select a specific button
        * retrieve its value

    Args:
        driver (webdriver) : Driver used for scrapping the site
    """

    clearBtn = utils.find_element(driver,globals_['DL_CLEAR_INPUT_AND_OUTPUT_BTN_XPATH'] )
    clearBtn.click()


def transform(driver, input, fileId):
    """ Transform code by scrapping the Daft Logic site

    Args:
        driver (webdriver): Browser for scrapping the site
        input (str): Content to be transformed (code)
        fileId (str): Id of file to be transformed
    
    Returns:
        boolean: True if input is successfully transformed, False otherwise
    """

    logFileDir = utils.get_log_file_dir(SUFFIX)
    outputFileDir = OUTPUT_DIR + fileId + globals_['DEFAULT_SEPARATOR'] + SUFFIX + globals_['DEFAULT_SEPARATOR']  +  globals_['DEFAULT_CONFIG'] + globals_['OUTPUT_FILE_EXTENSION']
    try:
        utils.send_input(driver, input, globals_['DL_INPUT_TA_XPATH'], globals_['DL_OBFUSCATE_BTN_XPATH'])
        utils.wait(2)
        output = utils.get_output(driver, globals_['DL_OUTPUT_TA_XPATH'])
        utils.write_to_file(outputFileDir, output)
        utils.wait()
        utils.write_to_log_on_success(fileId, logFileDir)
        clear_input_and_output(driver)
        return True
    except Exception as e:
        utils.write_to_log_on_failure(fileId, logFileDir, str(e))
        return False
    except ValueError as e:
        utils.write_to_log_on_failure(fileId, logFileDir, str(e))
        return False


def transform_input(directory, transformedFiles):
    """ Transform all files in a given directory with the Daft Logic obfuscator (by scrapping the site: https://www.daftlogic.com/projects-online-javascript-obfuscator.htm)

    Args:
        directory (str): Given directory (contains js files to be transformed)
        processedFiles (list) : List of files that were previously transformed
    """

    driver = utils.setup_driver(globals_['DL_URL'])
    utils.wait(5)
    concent_data_use(driver)
    utils.wait(5)

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
                    driver = utils.setup_driver(globals_['DL_URL'])
                    failCount += 1
                else:
                    failCount = 0
                utils.wait(globals_['INBETWEEN_WAITING_TIME']) 

    driver.quit()

