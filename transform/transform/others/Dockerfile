FROM ubuntu:latest

WORKDIR /app

# update 
RUN apt-get update

# install curl 
RUN apt-get -y install curl
# get install script and pass it to execute: 
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
# and install node 
RUN apt-get install nodejs

# install git
RUN apt install -y git


ENV DEBIAN_FRONTEND=noninteractive 

# Install OpenJDK-8
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;

# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

RUN \
  apt-get update && apt-get install -y --no-install-recommends --no-install-suggests curl bzip2 build-essential libssl-dev libreadline-dev zlib1g-dev && \
  rm -rf /var/lib/apt/lists/* && \
  curl -L https://github.com/sstephenson/ruby-build/archive/v20180329.tar.gz | tar -zxvf - -C /tmp/ && \
  cd /tmp/ruby-build-* && ./install.sh && cd / && \
  ruby-build -v 2.5.1 /usr/local && rm -rfv /tmp/ruby-build-* && \
  gem install bundler --no-rdoc --no-ri

RUN gem install jsobfu


# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package*.json ./
RUN npm install

# set working directory
COPY . .

RUN chmod +x ./tools/obfuscators/defendjs/transform.sh
RUN chmod +x ./tools/obfuscators/defendjs/configurations/1.sh
RUN chmod +x ./tools/obfuscators/defendjs/configurations/2.sh
#RUN chmod +x ./tools/obfuscators/defendjs/configurations/3.sh
#RUN chmod +x ./tools/obfuscators/defendjs/configurations/4.sh

RUN mkdir ./tools/obfuscators/defendjs/localInput/
RUN mkdir ./tools/obfuscators/defendjs/localOutput/


#CMD ["node", "transform.js"]
# node transform.js transformation-tool config-file (with extension)
#ENTRYPOINT ["node", "transform.js", "jsobfu", "1.json"]
