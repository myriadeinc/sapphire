'use strict';
const amq = require('amqplib');

const logger = require('src/util/logger.js').mq;
const config = require('src/util/config.js');

const queue = config.get('rabbitmq:queue') || 'Miner::Metrics';

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
  getChannel: () => {
    return channel;
  },

  init: (url) => {
    return amq.connect(url)
      .then((conn) => {
        return conn.createChannel();
      })
      .then((ch) => {
        channel = ch;
        logger.info("Messaging queue initialized!")
        return true;
      })
      .catch(err => {
        logger.error(err);
      });
  },

  registerConsumer: (cb) => {
    return channel.assertQueue(queue)
      .then((ok) => {
        return channel.consume(queue, (msg) => {
          if (null !== msg) {
            channel.ack(msg);

          logger.debug(`Consuming message: ${msg.content.toString()}\n from queue ${queue}`);
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
