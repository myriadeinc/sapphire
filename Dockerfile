FROM ubuntu:18.04 as builder

  RUN apt update && apt install -y nodejs npm 

  RUN apt-get install -y libboost-all-dev
  RUN apt-get update && apt-get install -y git
  WORKDIR /usr/src/build
  RUN chmod 777 /usr/src/build

  # Install && build app dependencies
  COPY . . 
  RUN rm -rf node_modules
  RUN npm install


FROM node:8.9.4-slim as app
  # Create app directory
  WORKDIR /usr/src/app

  RUN chown -R node:node /usr/src/app
  USER node

  # Bundle app source
  COPY --from=builder /usr/src/build/ /usr/src/app/

  # We don't run "npm start" because we don't want npm to manage the SIGTERM signal
  CMD [ "node", "src/main.js" ]
