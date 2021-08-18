import os
import shutil
import argparse
import utils

globals_ = utils.load_globals()

def clone_repos(numberRepos, source, filename, start_at):
    """ Clone repositories

    Args:
        numberRepos (str): number of repositories to clone
        source (str): type of repositores
        filename (str): file with the list of repositories to clone
        start_at (int): position of the list to start cloning the repositories
    """

    with open(filename) as f:
        repos = f.read().splitlines()


    if start_at > len(repos):
        print("Invalid starting point. start_at must be lower or equal to " + str(len(repos)))
        return
    
    count = 1
    pos = 1
    for repo in repos:
        if pos < start_at:
            pos += 1
        else:
            if count > numberRepos:
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
    parser.add_argument("--start_at", type=str)


    args = parser.parse_args()
    
    number_repos = int(args.number_repos)
    start_at = int(args.start_at)

    if(args.collect_option == "code"):
        filename = globals_['COLLECT_GITHUB_REPOS_TO_CLONE_EXTENSIONS_FILE']
        if(args.source == "vanilla"):
            filename = globals_['COLLECT_GITHUB_REPOS_TO_CLONE_VANILLA_FILE']
        if(args.source == "server"):
            filename = globals_['COLLECT_GITHUB_REPOS_TO_CLONE_SERVER_FILE']
        clone_repos(number_repos, args.source, filename, start_at)

    if(args.collect_option == "sources"):
        cmd = "node ./collectSources.js " + args.number_repos + " " + args.source
        os.system(cmd)
        
    
