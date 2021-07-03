'use strict';
const bunyan = require('bunyan')
  , bformat = require('bunyan-formatter')
  , formatOut = bformat({ outputMode: 'short', level: 'info' });
const gelfStream = require('gelf-stream')
const config = require('src/util/config.js');

const gelfHost = config.get('fluentd_host');
const gelfPort = config.get('fluentd_port');

let streams = [];
streams.push({ stream: formatOut });
if(gelfHost){
  streams.push({
    stream: gelfStream.forBunyan(gelfHost, gelfPort),
    type: 'raw'
  })
}


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