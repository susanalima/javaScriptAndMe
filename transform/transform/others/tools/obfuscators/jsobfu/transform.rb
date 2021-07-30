require 'jsobfu'
require 'date'
require "json"


CONFIG_DIR = "./tools/obfuscators/jsobfu/configurations/"

#Transform a snippet of code with the jsobfu tool, with all the specified configurations
# Params:
# +input+:: String containing the code to transform
# +fileId+:: Id of file transformed
# +configs+:: All the specified configurations for the jsobfu tool
def transform(inputFile, configFile)
  file = File.open(inputFile)
  input = file.read
  configFile = CONFIG_DIR + configFile
  config = File.read(configFile)
  hash = JSON.parse(config)
  configExtension = File.extname(configFile)
  configId = File.basename(configFile, configExtension) 
  iterations = hash['iterations']
  begin
    output = JSObfu.new(input).obfuscate(iterations:iterations)
    outputDir = "./output/obfuscated/jsobfu/"
    fileId = File.basename(inputFile, '.js')
    configId = File.basename(configFile, '.json')
    outputFile = outputDir + fileId + "_" + 'jsobfu' + "_" + configId + ".js"
    File.open(outputFile, 'w') { |file| file.write(output) }
  rescue IOError => e
    STDERR.puts e
  rescue SyntaxError => e
    STDERR.puts e
  rescue 
    STDERR.puts "Unknown reason."
  ensure
    file.close unless file.nil?
  end
end



transform(ARGV[0], ARGV[1])

