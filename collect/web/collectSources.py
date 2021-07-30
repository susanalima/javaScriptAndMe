from bs4 import BeautifulSoup as bs
import time
import utils

globals_ = utils.load_globals()


def get_urls_page(page, driver):
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

    for line in tableLines:
        target = line.find_all("td")[2].find("a").text
        target = "http://" + str(target)  + "\n"
        utils.write_to_file(globals_['COLLECT_WEB_URLS_TO_VISIT_FILE'], target, globals_['APPEND_WRT_MODE'])



def get_sources(number_urls): 
    
    urlsPerPage = 100
    numberPages = int(number_urls/urlsPerPage)

    driver = utils.setup_driver()

    page = 0
    for _ in range(numberPages):
        get_urls_page(page, driver)
        page += urlsPerPage

    driver.quit()