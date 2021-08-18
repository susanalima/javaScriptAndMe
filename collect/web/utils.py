import requests
from bs4 import BeautifulSoup as bs
from urllib.parse import urljoin
from selenium import webdriver
import re
import os
import time
import requests
import json
from datetime import datetime



"""" Directory to globals file """
GLOBALS_FILE = "./globals/globals.json"


def load_globals():
    """ Read content from globals file

    Returns:
        dict: dictionary containing the content of the globals file
    """
    with open(GLOBALS_FILE) as f:
        data = json.load(f)
    return data


globals_ = load_globals()


def setup_driver():
    """ Setup browser for scrapping the site

    Returns:
        webdriver: Chrome driver
    """

    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--window-size=1420,1080')
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    driver = webdriver.Chrome(options=chrome_options)
    return driver


def read_from_file(inputFileDir):
    """ Read file contents

    Args:
        inputFileDir (str): path to file

    Returns:
        str: content of the specified file
    """

    with open(inputFileDir, "r") as inputFile:
        return inputFile.read()


def write_to_file(outputFileDir, data, mode=globals_['DEFAULT_WRT_MODE']):
    """ Write data to file

    Args:
        outputFileDir (str): path to file
        data (str): data to write in the file
        mode (str): file open mode (w by default)

    Returns:
        str: result of writting the data to the file
    """

    with open(outputFileDir, mode) as outputFile:
        return outputFile.write(data)


def make_dir(directory):
    """ Create a directory of it does not exist

    Args:
        directory (str): directory to create

    """

    if not os.path.exists(directory):
        os.makedirs(directory)


def get_url_name(url):
    """ Get the name of a website from its url

    Args:
        url (str): website url
    """

    regex= r'http(s)*:\/\/((.*?)\.)?(.*)\.(.+)'
    name = re.match(regex, url)
    return name[4]


def write_to_references_file(ref):
    """ Write a reference to the references file

    Args:
        ref (str): reference to write
    """

    ref = ref + "\n"
    write_to_file(globals_['COLLECT_WEB_REFERENCES_FILE_DIR'], ref, globals_['APPEND_WRT_MODE'])



def get_urls_to_visit():
    """ Get list of all the files that were previously transformed (stored in ./logs/transformed/transformed.txt )

    Returns:
        list: all files previously transformed
    """

    try: 
        return read_from_file(globals_['COLLECT_WEB_URLS_TO_VISIT_FILE']).splitlines()
    except Exception as e:
        return []


def build_log_data_on_success(url):
    """ Build and format log data in case of successful operation

    Args:
        url (str): url of site being scrapped

    Returns:
        str: formatted log data 
    """

    currDate = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return globals_['LOG_HEADER'] + globals_['LOG_SEPARATOR'] + ulr + globals_['LOG_SEPARATOR'] + currDate + globals_['LOG_SEPARATOR'] + globals_['LOG_SUCCESS'] + globals_['LOG_SEPARATOR']  + globals_['LOG_TAIL'] + globals_['LOG_LINE_BREAK']



def build_log_data_on_failure(url, error):
    """ Build and format log data in case of failed operation

    Args:
        url (str): url of site being scrapped
        error (str): error message

    Returns:
        str: formatted log data 
    """

    currDate = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return globals_['LOG_HEADER'] + globals_['LOG_SEPARATOR'] + url + globals_['LOG_SEPARATOR'] + currDate + globals_['LOG_SEPARATOR'] + globals_['LOG_FAILURE'] + globals_['LOG_LINE_BREAK'] +  globals_['LOG_LINE_INDENTATION'] + error + globals_['LOG_SEPARATOR']  + globals_['LOG_TAIL'] + globals_['LOG_LINE_BREAK']



def write_to_log_on_failure(url, logFileDir, error = globals_['DEFAULT_ERROR']):
    """ Write log data to log file in case of failed operation

    Args:
        url (str): url of site being scrapped
        logFileDir (str): path to log directory (Unknown reason by default)
        error (str): error message
    """

    logData = build_log_data_on_failure(url, error)
    write_to_file(logFileDir, logData, globals_['APPEND_WRT_MODE'])



def write_to_log_on_success(url, logFileDir):
    """ Write log data to log file in case of successful operation

    Args:
        url (str): url of site being scrapped
        logFileDir (str): path to log directory
    """

    logData = build_log_data_on_success(url)
    write_to_file(logFileDir, logData, globals_['APPEND_WRT_MODE'])



def download_url_javascript(url, outputFileDir):
    """ Download javascript from a reference

    Args:
        url (str): reference
        outputFileDir (str): file to store the downloaded content
    """

    response = requests.get(url, stream=True)
    buffer_size = 1024
    progress = response.iter_content(buffer_size)
    with open(outputFileDir, "wb") as f:
        for data in progress:
            f.write(data)


def get_start_position():
    """ Get number of line to start visting the urls

    Returns:
        number: line number
    """

    try:
        with open(globals_['COLLECT_WEB_LOG_FILE_DIR']) as f:
            data = f.read()
        matches = re.findall(r'-.(O|o)peration.', data)
    except Exception:
        matches = []
    return len(matches)