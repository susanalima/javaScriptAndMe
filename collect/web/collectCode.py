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
                    #utils.write_to_references_file(ref)
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
    urlsToVisit = utils.get_urls_to_visit()

    if start_at == -1:
        start_at = utils.get_start_position() + 1

    if number_urls >= len(urlsToVisit):
        number_urls = len(urlsToVisit)

    failCount = 0
    urlsToVisit = urlsToVisit[start_at-1:start_at+number_urls-1]

    for url in urlsToVisit:
        if failCount > 10:
            print("Failed too much")
            break
        #get_url_javascript(url)
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
        get_sources(number_urls )
