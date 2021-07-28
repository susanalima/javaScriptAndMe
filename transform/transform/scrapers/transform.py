import sys
import daftLogic.transform as daftLogic 
import javascript2img.transform as javascript2img
from utils import load_globals, get_transformed_files

""" Dictionay storing all the global variables """
globals_ = load_globals()

if __name__ == "__main__":
    transformFlag = sys.argv[1]
    transformedFiles = get_transformed_files(transformFlag)
    if transformFlag == globals_['DAFT_LOGIC']:
        daftLogic.transform_input(globals_['TRANSFORM_INPUT_DIR'], transformedFiles)
    elif transformFlag == globals_['JAVASCRIPT2IMG']:
        javascript2img.transform_input(globals_['TRANSFORM_INPUT_DIR'], transformedFiles)
    else:
        print("Invalid suffix.")
