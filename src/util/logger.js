'use strict';
const bunyan = require('bunyan')
  , bformat = require('bunyan-formatter')
  , formatOut = bformat({ outputMode: 'short', level: 'debug' });
const gelfStream = require('gelf-stream')
const config = require('src/util/config.js');

const gelfHost = config.get('fluentd_host') || 'localhost';
const gelfPort = config.get('fluentd_port') || 9999;

let streams = [];
streams.push({ stream: formatOut });
streams.push({
  stream: gelfStream.forBunyan(gelfHost, gelfPort),
  type: 'raw'
})

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