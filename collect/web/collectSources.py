from bs4 import BeautifulSoup as bs
import time
import utils
import os


globals_ = utils.load_globals()


def get_urls_page(page, number_urls, index, driver):
    """ Get code from websites

    Args:
        page (int): page in the website
        number_urls (int): number of sites to retrieve
        index (int): index in the page to start retrieving the urls
        driver (Chrome driver): Chrome driver used to visit the site
    """


    url = "https://de.majestic.com/reports/majestic-million?s=" + str(page)
    try:
        driver.get(url)
    except Exception:
        print("Failed")
        driver.quit()

    #small delay to allow the loading of the page
    time.sleep(1)

    # get the HTML content
    html = driver.page_source

    #parse HTML using beautiful soup
    soup = bs(html, "html.parser")

    tableLinesOdd = soup.find_all("tr", {"class": "odd"})
    tableLinesEven = soup.find_all("tr", {"class": "even"})


    tableLines = [None]*(len(tableLinesOdd)+len(tableLinesEven))
    tableLines[::2] = tableLinesOdd
    tableLines[1::2] = tableLinesEven


    outputFile = globals_['COLLECT_WEB_URLS_TO_VISIT_FILE']

    if not os.path.exists(outputFile):
        open(outputFile,"w+")

    count = 0
    pos = 0

    for line in tableLines:
        if count >= number_urls:
            return count
        if pos < index:
            pos += 1
        else:
            target = line.find_all("td")[2].find("a").text
            target = "http://" + str(target)  + "\n"
            utils.write_to_file(outputFile, target, globals_['APPEND_WRT_MODE'])
            count += 1
            pos += 1
  
    
    return count



def get_sources(number_urls, start_at = 1): 
    """ Get list of websites from https://de.majestic.com/reports/majestic-million?

    Args:
        number_urls (int): number of sites to retrieve
        start_at (int): index in the site to start retrieving the urls
    """
    
    urlsPerPage = 100

    start_at -= 1

    numberPages = int((number_urls  + start_at)/urlsPerPage) + 1

    driver = utils.setup_driver()

    page = 0

    count = 0

    startC = int(start_at/urlsPerPage) 

    index = start_at - urlsPerPage * startC


    for c in range(numberPages):
        if c >= startC:
            count += get_urls_page(page, number_urls - count, index, driver)
        page += urlsPerPage

    driver.quit()