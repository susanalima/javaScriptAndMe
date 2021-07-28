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

# install and cache app dependencies
COPY package*.json ./
RUN npm install

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
  && apt-get install -y python3-pip python3-dev \
  && cd /usr/local/bin \
  && ln -s /usr/bin/python3 python \
  && pip3 install --upgrade pip

# install git
RUN apt install -y git

# set working directory
COPY . .
