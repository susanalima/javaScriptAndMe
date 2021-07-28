import os
import shutil
import argparse
import utils

globals_ = utils.load_globals()

def clone_repos(numberRepos, source, filename):
    """ Clone repositories

    Args:
        numberRepos (str): Number of repositories to clone
    """
    
    startAt = utils.get_start_position(source) + 1

    with open(filename) as f:
        repos = f.read().splitlines()
    count = 1
    pos = 1
    for repo in repos:
        if pos < startAt:
            pos += 1
        else:
            if  count > numberRepos:
                break
            cmd = "cd " + globals_['COLLECT_GITHUB_OUTPUT_DIR'] + "; git clone " + repo
            try:
                os.system(cmd)  
                utils.write_to_log_on_success(repo, globals_['COLLECT_GITHUB_LOG_FILE_DIR'], source)
            except Exception as e:
                utils.write_to_log_on_failure(repo, globals_['COLLECT_GITHUB_LOG_FILE_DIR'],source, str(e))
            count += 1               


if __name__ == '__main__':
        
    parser = argparse.ArgumentParser()
    parser.add_argument("--collect_option", type=str)
    parser.add_argument("--number_repos", type=str)
    parser.add_argument("--source", type=str)

    args = parser.parse_args()
    
    number_repos = int(args.number_repos)

    if(args.collect_option == "code"):
        filename = globals_['COLLECT_GITHUB_REPOS_TO_CLONE_EXTENSIONS_FILE']
        if(args.source == "vanilla"):
            filename = globals_['COLLECT_GITHUB_REPOS_TO_CLONE_VANILLA_FILE']
        if(args.source == "server"):
            filename = globals_['COLLECT_GITHUB_REPOS_TO_CLONE_SERVER_FILE']
        clone_repos(number_repos, args.source, filename)

    if(args.collect_option == "sources"):
        cmd = "node ./collectSources.js " + args.number_repos + " " + args.source
        os.system(cmd)
        
    
