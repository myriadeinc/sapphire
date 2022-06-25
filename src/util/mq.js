'use strict';
const amq = require('amqplib');

const logger = require('src/util/logger.js').mq;
const config = require('src/util/config.js');

const queue = config.get('rabbitmq:queue') || 'Miner::Metrics';

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
} 

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

  init: async (url, timeout = 1) => {

    await delay(3000 * timeout)
    try {
      const conn = await amq.connect(url)
      const ch = await conn.createChannel()
      channel = ch
      logger.info("Messaging Queue Connected!")
      return true
    } catch (e){
      logger.error("Could not connect to RabbitMQ!")
      logger.error(e);
      await MQ.init(url, timeout * 2)
    }
    // return amq.connect(url)
    //   .then((conn) => {
    //     return conn.createChannel();
    //   })
    //   .then((ch) => {
    //     channel = ch;
    //     logger.info("Messaging queue initialized!")
    //     return true;
    //   })
    //   .catch(err => {
    //     logger.error(err);
    //   });
  },

  registerConsumer: async (cb) => {
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
