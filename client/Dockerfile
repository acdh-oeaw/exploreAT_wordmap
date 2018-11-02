FROM node:8.12.0-alpine

# Create app directory and use it as the working directory
RUN mkdir -p /srv/app/exploreat_client
WORKDIR /srv/app/exploreat_client

COPY package.json /srv/app/exploreat_client
COPY package-lock.json /srv/app/exploreat_client

RUN npm install

COPY . /srv/app/exploreat_client

CMD ["npm", "start"]