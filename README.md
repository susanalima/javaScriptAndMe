# dataset-tool

* [Collect JavaScript code](./collect/README.md)
* [Process JavaScript code](./process/README.md)
* [Transform JavaScript code](./transform/README.md)

## TODO

1. Delete unused code
2. Update comments

### Collect

1. Run and test code
2. Add run help / usage in parameters
3. Add source to filename
4. Refactor hardcoded names
5. Check clean and init scripts
6. Check when program re-run (should start from where it stopped) -> collectSources and collectCode

### Process

1. Run and test code
2. Add run help / usage in parameters
3. Rename files
4. Remove obfuscation filtering
5. Check clean and init scripts
6. Check when program re-run (should start from where it stopped)
7. Refactor process.filter

### Transform

1. Run and test code
2. Add run help / usage in parameters
3. Remove transform with all configuration option
4. Fix scrapers name (add config 1)
5. Remove hardcoded tool names and configs
6. Check clean and init scripts
6. Check when program re-run (should start from where it stopped) ??
7. Add timeout to scrapers
8. Refactor transform.transform_input

### Paper

1. Collection Stats
2. Filtering Stats
3. Transformation Stats