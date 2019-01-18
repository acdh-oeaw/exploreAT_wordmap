FROM node:10.15.0-alpine

# Create app directory and use it as the working directory
RUN mkdir -p /srv/app/exploreat_server
WORKDIR /srv/app/exploreat_server

COPY package.json /srv/app/exploreat_server
COPY package-lock.json /srv/app/exploreat_server

RUN npm install

COPY . /srv/app/exploreat_server
