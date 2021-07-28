from selenium import webdriver
import time
import os
from datetime import datetime
import json



"""" Directory to globals file """
GLOBALS_FILE = "./globals/globals.json"


def load_globals():
    """ Read content from globals file

    Returns:
        dict: fDictionary containing the content of the globals file
    """
    with open(GLOBALS_FILE) as f:
        data = json.load(f)
    return data


globals_ = load_globals()


def build_output_dir(suffix):
    """ Build output directory

    Args:
        sufix (str): Label of the tool

    Returns:
        str: output directory
    """

    return globals_['OBFUSCATED_OUTPUT_DIR'] +  globals_['DIR_SEPARATOR'] + suffix +  globals_['DIR_SEPARATOR']

def get_file_id(fileName):
    """ Get file name without extension

    Args:
        fileName (str): Name of the file (with extension)

    Returns:
        str: filename without file extension
    """

    return fileName.split('.')[0]


def read_from_file(inputFileDir):
    """ Read file contents

    Args:
        inputFileDir (str): Path to file

    Returns:
        str: content of the specified file
    """

    with open(inputFileDir, "r") as inputFile:
        return inputFile.read()


def write_to_file(outputFileDir, data, mode=globals_['DEFAULT_WRT_MODE']):
    """ Write data to file

    Args:
        outputFileDir (str): Path to file
        data (str): Data to write in the file
        mode (str): File open mode (w by default)

    Returns:
        str: result of writting the data to the file
    """

    with open(outputFileDir, mode) as outputFile:
        return outputFile.write(data)


def get_transformed_files(transformFlag):
    """ Get list of all the files that were previously transformed (stored in ./logs/transformed/transformed.txt )

    Returns:
        list: All files previously transformed
    """

    try: 
        logFileDir = get_log_file_dir(transformFlag)
        transformedFiles = []
        logLines = read_from_file(logFileDir).splitlines()
        for line in logLines:
            tokens = line.split(globals_['LOG_SEPARATOR'])
            if(len(tokens) > 0):
                transformedFiles.append(tokens[0] + globals_['INPUT_FILE_EXTENSION'])
        print(transformedFiles)
        return transformedFiles
    except Exception:
        return []


def get_log_file_dir(suffix):
    return globals_['TOOLS_LOG_DIR'] + suffix + globals_['DEFAULT_SEPARATOR'] + globals_['DEFAULT_CONFIG'] + globals_['LOG_FILE_EXTENSION']


def write_to_transformed_log_file(fileName):
    """ Write data to ../logs/input/transformed/transformed.txt

    Args:
        fileName (str): Name of file transformed
    """

    data = fileName + globals_['LOG_LINE_BREAK']
    write_to_file(globals_['SCRAPERS_TRANSFORMED_LOG_DIR'], data, globals_['APPEND_WRT_MODE'])





def setup_driver(url):
    """ Setup browser for scrapping the site

    Returns:
        webdriver: Chrome driver
    """

    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--window-size=1420,1080')
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    driver = webdriver.Chrome(chrome_options=chrome_options)
    driver.get(url)
    return driver


def find_element(driver, xpath):
    """ Find element by xpath

    Args:
        driver (webdriver): Driver used for scrapping the site
        xpath (str): Xpath to find the element

    Returns:
        webelement: first element found that corresponds to the xpath provided
    """

    elems = driver.find_elements_by_xpath(xpath)
    if len(elems) < 1:
        raise ValueError('Element not found.')
    else:
        return elems[0]


def send_input(driver, input, taXpath, btnXpath):
    """ Send input to the site.
        * select a specific text area
        * send input
        * click button to obfuscate

    Args:
        driver (webdriver) : Driver used for scrapping the site
        input (str): Code to be transformed
    """

    taInput = find_element(driver,taXpath)
    taInput.click()
    wait()
    taInput.send_keys(input)
    wait()
    obfuscateBtn = find_element(driver, btnXpath)
    wait()
    obfuscateBtn.click()


def wait(seconds = globals_['DEFAULT_WAITING_TIME']):
    """ Wait for specified seconds

    Args:
        seconds (number): Amount of seconds to wait
    """

    time.sleep(seconds)
    

def get_output(driver, taXpath):
    """ Get output from transforming the code.
        * select a specific text area
        * retrieve its value

    Args:
        driver (webdriver) : Driver used for scrapping the site
    
    Returns:
        str: transformed code
    """
    
    taOutput = find_element(driver, taXpath)
    output = taOutput.get_attribute(globals_['TA_VALUE'])
    return output




def build_log_data_on_success(fileId):
    """ Build and format log data in case of successful operation

    Args:
        fileId (str): Id of file transformed

    Returns:
        str: Formatted log data 
    """

    currDate = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return fileId + globals_['LOG_SEPARATOR'] + currDate + globals_['LOG_SEPARATOR'] + globals_['LOG_SUCCESS'] + globals_['LOG_LINE_BREAK']



def build_log_data_on_failure(fileId, error):
    """ Build and format log data in case of failed operation

    Args:
        fileId (str): Id of file transformed
        error (str): Error message

    Returns:
        str: Formatted log data 
    """

    currDate = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return fileId + globals_['LOG_SEPARATOR'] + currDate + globals_['LOG_SEPARATOR'] + globals_['LOG_FAILURE'] + globals_['LOG_LINE_BREAK'] +  globals_['LOG_LINE_INDENTATION'] + error + globals_['LOG_LINE_BREAK']



def write_to_log_on_failure(fileId, logFileDir, error = globals_['DEFAULT_ERROR']):
    """ Write log data to log file in case of failed operation

    Args:
        fileId (str): Id of file transformed
        logFileDir (str): Path to log directory (Unknown reason by default)
        error (str): Error message
    """

    logData = build_log_data_on_failure(fileId, error)
    write_to_file(logFileDir, logData, globals_['APPEND_WRT_MODE'])



def write_to_log_on_success(fileId, logFileDir):
    """ Write log data to log file in case of successful operation

    Args:
        fileId (str): Id of file transformed
        logFileDir (str): Path to log directory
        error (str): Error message
    """

    logData = build_log_data_on_success(fileId)
    write_to_file(logFileDir, logData, globals_['APPEND_WRT_MODE'])


