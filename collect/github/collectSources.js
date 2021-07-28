const fs = require('fs');
const { Octokit } = require("@octokit/core");

const octokit = new Octokit();

/**
 * Directory to globals file
 */
 const GLOBALS_FILE = "./globals/globals.json"

 /**
  * Dictionay storing all the global variables
  */
 const globals = load_globals()
 
 
 /**
  * Read content from globals file
  */
 function load_globals() {
     const data = fs.readFileSync(GLOBALS_FILE, "utf-8");
     return JSON.parse(data);
 }


/**
 * Write to data to file
 * @param {*} fileDir Absolute path to file
 * @param {*} data Data to store
 */
function store(fileDir, data) {
    fs.appendFileSync(fileDir, data, (err) => { 
        if (err) throw err; 
    })
}

/**
 * Make a request to Github's REST API
 * @param {*} perPage number of results per page
 * @param {*} page number of page
 * @param {*} q query to ask
 */
async function requestGithub(perPage, page, q) {
    const {data, status} = await octokit.request('GET /search/repositories', {
        per_page: perPage,
        page,
        q,
      })
    return {data, status}
}


/**
 * Get repositories to clone from github
 * @param {*} perPage number of results per page
 * @param {*} page number of page
 * @param {*} q query to ask
 */
async function getRepositoriesToClonePerPage(perPage, page, q, filename){
    try {
        const {data, status} = await requestGithub(perPage, page, q);
        if(status !== 200)
            return false;
        let reposToClone = ""
        const {items} = data;
        items.forEach(item => {
            const {clone_url} = item;
            reposToClone += clone_url + "\n"
        })
        store(filename, reposToClone)
    } catch (error) {
        return false
    }

    return true
}


/**
 * Sleep for a specified number of milliseconds
 * @param {*} ms Number of milliseconds
 * @returns 
 */
function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  } 


/**
 * Get list of with a specified number of repositories from github
 * @param {*} numberRepos Number of repos to retrieve
 * @param {*} perPage number of results per page
 * @param {*} q query to ask
 */
async function getRepositoriesToClone(numberRepos, perPage, q, filename){
    const numberPages = numberRepos/perPage
    let nrTries = 0
    for (let page = 0; page <= numberPages; page++) {
        const success = await getRepositoriesToClonePerPage(PER_PAGE, page, q, filename)
        if(!success){
            if(nrTries > 4)
                return
            nrTries += 1
            await sleep(60000)
        }
    }
}


const args = process.argv.slice(2);
let numberRepos = parseInt(args[0])
const source = args[1]

if(numberRepos === undefined || numberRepos < 100)
    numberRepos = 100


const PER_PAGE = 100


const chromeExtensionsQ = '"chrome extension"+language:JavaScript%26sort=stars%26order=desc'
const vanillaJSQ = '"vanilla javascript"+language:JavaScript%26sort=stars%26order=desc'
const serverJSQ = '"server-side"+language:JavaScript%26sort=stars%26order=desc'

let q = chromeExtensionsQ
let filename = globals.COLLECT_GITHUB_REPOS_TO_CLONE_EXTENSIONS_FILE

if(source === "vanilla"){
    q = vanillaJSQ
    filename = globals.COLLECT_GITHUB_REPOS_TO_CLONE_VANILLA_FILE
}
if(source === "server"){
    q = serverJSQ
    filename = globals.COLLECT_GITHUB_REPOS_TO_CLONE_SERVER_FILE
}
getRepositoriesToClone(numberRepos, PER_PAGE, q, filename)



