'use strict';
const amq = require('amqplib');

const logger = require('src/util/logger.js').mq;
const config = require('src/util/config.js');

const queue = config.get('rabbitmq:queue') || 'Miner::Metrics';

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
} 

let channel;

// const toBuffer = (obj) => {
//   let str = obj;
//   if ('string' !== typeof myVar) {
//     str = JSON.stringify(obj);
//   }
//   const buff = Buffer.from(str, 'utf8');
//   return buff;
// };

const MQ = {


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
  },

  registerConsumer: async (cb) => {
    try {
      const queueExists = channel.assertQueue(queue)
      return channel.consume(queue, (msg) => {
        if (null !== msg) {
        channel.ack(msg);
        logger.debug(`Consuming message: ${msg.content.toString()}\n from queue ${queue}`);
        return cb(JSON.parse(msg.content.toString()));
        }
      })
    } catch(e){
        logger.error(err);

    }


  },

};

module.exports = MQ;
