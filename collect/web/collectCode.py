from bs4 import BeautifulSoup as bs
from urllib.parse import urljoin
import re
import time
import argparse
from collectSources import get_sources
import utils
import multiprocessing


globals_ = utils.load_globals()


def get_url_javascript(url, driver, response):
    """ Get code from a website

    Args:
        url (str): url of the website
        driver (Chrome driver): Chrome driver used to visit the site
        response (boolean) : Return value to represent if the operation was successful or not
    """
    response = True

    try: 
        urlName = utils.get_url_name(url)

        outputDir = globals_['COLLECT_WEB_OUTPUT_DIR'] + urlName

        utils.make_dir(outputDir)

        time.sleep(2)

        driver.get(url)

        time.sleep(5)

        # get the HTML content
        html = driver.page_source
        #parse HTML using beautiful soup
        soup = bs(html, "html.parser")
        
        scripts = soup.find_all("script")
        extension = ".js"

        scriptNr = 0
        for script in scripts:
            src = script.attrs.get("src")
            type_ = script.attrs.get("type")
            
            if not type_ or type_ == "text/javascript" or type_ == "application/javascript":
                if src:
                    ref = urljoin(url, src)
                    minified = re.match(r'\.min\.js', ref)
                    if minified:
                        extension = ".min.js"
                    outputFileDir = outputDir + globals_['DIR_SEPARATOR'] + urlName + globals_['DEFAULT_SEPARATOR'] + str(scriptNr) + globals_['DEFAULT_SEPARATOR'] + "ref" + extension
                    utils.download_url_javascript(ref, outputFileDir)
                else:
                    outputFileDir = outputDir + globals_['DIR_SEPARATOR'] + urlName + globals_['DEFAULT_SEPARATOR'] + str(scriptNr) + globals_['DEFAULT_SEPARATOR'] + "inline" + extension 
                    utils.write_to_file(outputFileDir, script.string)
                
                scriptNr += 1
        
        utils.write_to_log_on_success(url, globals_['COLLECT_WEB_LOG_FILE_DIR'])
   
    except Exception as e:
        utils.write_to_log_on_failure(url, globals_['COLLECT_WEB_LOG_FILE_DIR'], str(e))
        response = False

    if driver != "":
        driver.quit()
    



def scrap_web(number_urls, start_at):
    """ Get code from websites

    Args:
        number_urls (int): number of sites to visit
        start_at (int): index in urlsToVsit.txt list of the first site to visit 
    """

    urlsToVisit = utils.get_urls_to_visit()

    if start_at > number_urls:
        print("Invalid starting point. start_at must be lower or equal to " + str(len(urlsToVisit)))
        return


    failCount = 0

    startIndex = start_at-1



    if start_at+number_urls-1  >= len(urlsToVisit):
        endIndex = len(urlsToVisit)
    else:
        endIndex = start_at+number_urls-1

    urlsToVisit = urlsToVisit[startIndex:endIndex]

    for url in urlsToVisit:
        if failCount > 10:
            print("Failed too much")
            break
        response = True
        try:
            driver = utils.setup_driver()
        except Exception:
            driver = ""
        p = multiprocessing.Process(target=get_url_javascript, name="get_url_javascript", args=(url,driver, response))
        p.start()
        p.join(5*60)
        if p.is_alive():
            p.terminate()
            p.join()
            utils.write_to_log_on_failure(url, globals_['COLLECT_WEB_LOG_FILE_DIR'], "Process killed due to timeout.")
            driver.quit()
        
        if not response:
            failCount += 1



if __name__ == '__main__':
        
    parser = argparse.ArgumentParser()
    parser.add_argument("--collect_option", type=str)
    parser.add_argument("--number_urls", type=str)
    parser.add_argument("--start_at", type=str)

    args = parser.parse_args()
    
    number_urls = int(args.number_urls)
    start_at = int(args.start_at)

    if(args.collect_option == "code"):
        scrap_web(number_urls, start_at)

    if(args.collect_option == "sources"):
        get_sources(number_urls, start_at)
