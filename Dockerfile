FROM node:10.17.0-slim as app
  # Create app directory
  WORKDIR /usr/src/app

  RUN chown -R node:node /usr/src/app
  USER node

  # Bundle app source
  COPY . /usr/src/app/

  # We don't run "npm start" because we don't want npm to manage the SIGTERM signal
  CMD [ "node", "src/main.js" ]