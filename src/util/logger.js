'use strict';
const bunyan = require('bunyan')
  , bformat = require('bunyan-formatter')
  , formatOut = bformat({ outputMode: 'short', level: 'info' });
const config = require('src/util/config.js');



let streams = [];
streams.push({ stream: formatOut });



const logger = bunyan.createLogger({
  name: 'sapphire',
  streams
});

module.exports = {
  core: logger.child({ component: 'core' }),
  account: logger.child({ component: 'account' }),
  db: logger.child({ component: 'db' }),
  mq: logger.child({ component: 'mq' }),
  job: logger.child({ component: 'job' }),
  xmr: logger.child({ component: 'xmr' }),
  minerRepository: logger.child({ component: 'minerRepository' }),
};