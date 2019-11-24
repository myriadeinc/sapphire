'use strict';
const amq = require('amqplib');

const logger = require('src/util/logger.js').mq;
const config = require('src/util/config.js');

const queue = config.get('rabbitmq:queue');
let channel;

const toBuffer = (obj) => {
  let str = obj;
  if ('string' !== typeof myVar) {
    str = JSON.stringify(obj);
  }
  const buff = Buffer.from(str, 'utf8');
  return buff;
};

const MQ = {

  channel,

  init: (url) => {
    return amq.connect(url)
        .then((conn) => {
          return conn.createChannel();
        })
        .then((ch) => {
          MQ.channel = ch;
          return true;
        })
        .catch(logger.error);
  },

  send: (msg) => {
    return MQ.channel.assertQueue(queue)
        .then((ok) => {
          logger.info(`Sending: ${msg}\n on queue ${queue}`);
          return MQ.channel.sendToQueue(queue, toBuffer(msg));
        })
        .then(() => {
          return 0;
        })
        .catch((err) => {
          logger.error(err);
          logger.error(`Error occured while sending: \n ${msg}`);
          return -1;
        });
  },

  registerConsumer: (cb) => {
    return MQ.channel.assertQueue(queue)
        .then((ok) => {
          return MQ.channel.consume(queue, (msg) => {
            if (null !== msg) {
              MQ.channel.ack(msg);
              logger.info(`Consuming message: ${msg.content.toString()}\n from queue ${queue}`);
              return cb(JSON.parse(msg.content.toString()));
            }
          });
        })
        .catch((err) => {
          logger.error(err);
        });
  },

};

module.exports = MQ;
