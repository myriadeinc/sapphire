FROM node:8.9.4

ARG NPM_TOKEN_ARG

ENV NODE_ENV ""
ENV NPM_TOKEN $NPM_TOKEN_ARG

# Create app directory
WORKDIR /usr/src/app

RUN chown -R node:node /usr/src/app
USER node

# Install app dependencies
COPY package.json package-lock.json ./
COPY .npmrc .
RUN npm install

# Bundle app source
COPY . .

# We don't run "npm start" because we don't want npm to manage the SIGTERM signal
CMD [ "node", "src/main.js" ]
