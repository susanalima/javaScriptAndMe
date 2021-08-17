import os
import json
import re
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


def build_log_data_on_success(module):
    """ Build and format log data in case of successful operation

    Args:
        module (str): module of site being scrapped

    Returns:
        str: formatted log data 
    """

    currDate = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return globals_['LOG_HEADER'] + globals_['LOG_SEPARATOR'] + module + globals_['LOG_SEPARATOR'] + currDate + globals_['LOG_SEPARATOR'] + globals_['LOG_SUCCESS'] + globals_['LOG_SEPARATOR']  + globals_['LOG_TAIL'] + globals_['LOG_LINE_BREAK']



def build_log_data_on_failure(module, error):
    """ Build and format log data in case of failed operation

    Args:
        module (str): module of site being scrapped
        error (str): error message

    Returns:
        str: formatted log data 
    """

    currDate = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return globals_['LOG_HEADER'] + globals_['LOG_SEPARATOR'] + module + globals_['LOG_SEPARATOR'] + currDate + globals_['LOG_SEPARATOR'] + globals_['LOG_FAILURE'] + globals_['LOG_LINE_BREAK'] +  globals_['LOG_LINE_INDENTATION'] + error + globals_['LOG_SEPARATOR']  + globals_['LOG_TAIL'] + globals_['LOG_LINE_BREAK']



def write_to_log_on_failure(module, logFileDir, error = globals_['DEFAULT_ERROR']):
    """ Write log data to log file in case of failed operation

    Args:
        module (str): module of site being scrapped
        logFileDir (str): path to log directory (Unknown reason by default)
        error (str): error message
    """

    logData = build_log_data_on_failure(module, error)
    write_to_file(logFileDir, logData, globals_['APPEND_WRT_MODE'])



def write_to_log_on_success(module, logFileDir):
    """ Write log data to log file in case of successful operation

    Args:
        module (str): module of site being scrapped
        logFileDir (str): path to log directory
    """

    logData = build_log_data_on_success(module)
    write_to_file(logFileDir, logData, globals_['APPEND_WRT_MODE'])

