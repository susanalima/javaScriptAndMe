# dataset-tool


Before running replace the `/home/susana/Documents/dataset-tool/` in all `run.sh` files in the program by the absolute directory of the code on your workstation.


* [Collect JavaScript code](./collect/README.md)
* [Process JavaScript code](./process/README.md)
* [Transform JavaScript code](./transform/README.md)

## TODO

1. Delete unused code
2. Update comments
3. Improve error handling
4. Update READMES
5. Check if sudos are required
6. process readme add detailed requirements for filtering a file
7. explain how to add more tools or configurations
    * in defendjs the dockerfile must be changed


### Collect

1. Run code : done
2. Add run help / usage : done
4. Refactor hardcoded names
5. Check clean and init scripts : done
6. Check when program re-run (should start from where it stopped) -> collectSources and collectCode : done
7. Check Logs : done


### Process

1. Run code : done
2. Add run help / usage 
3. Rename files : done
4. Remove obfuscation filtering : done
5. Check clean and init scripts : done
6. Check when program re-run (should start from where it stopped) : done
7. Refactor process.filter
8. Check Logs : done
3. Add source to filename

### Transform

1. Run code : done
2. Add run help / usage 
3. Remove transform with all configuration option : done
4. Fix scrapers name (add config 1) : done
5. Remove hardcoded tool names and configs : done
6. Check clean and init scripts : done
6. Check when program re-run (should start from where it stopped) done
7. Add timeout to scrapers : no!
8. Refactor transform.transform_input ?
9. Update jfogs : done
10. Remove gnirts : done
11. Check Logs : done

### Paper

1. Search how this type of paper is normaly written
2. Architecture diagram (pipeline and modules interaction)
3. Restructure sections (remove unnecessary experiments, only keep baseline - binary and multiclass)
4. Collection Stats
5. Filtering Stats
6. Transformation Stats
