from bs4 import BeautifulSoup as bs
import time
import utils
import os

globals_ = utils.load_globals()


def get_urls_page(page, numberUrls, index, driver):
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

    tableLines = soup.find_all("tr", {"class": "odd"})
    tableLines.extend(soup.find_all("tr", {"class": "even"}))

    outputFile = globals_['COLLECT_WEB_URLS_TO_VISIT_FILE']

    if not os.path.exists(outputFile):
        f = open(outputFile,"w+")

    count = 0
    pos = 0

    for line in tableLines:
        if count >= numberUrls:
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
    
    urlsPerPage = 100

    start_at -= 1

    numberPages = int((number_urls  + start_at)/urlsPerPage) + 1

    print(numberPages)

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