'use strict';
const bunyan = require('bunyan')
, bformat = require('bunyan-formatter')  
, formatOut = bformat({ outputMode: 'short', level: 'debug'});

const config = require('src/util/config.js');

let LogDNAStream = require('logdna-bunyan').BunyanStream;
let logDNA = new LogDNAStream({
  key: config.get('log:logdna_api_token')
});

const logger = bunyan.createLogger({
  name: 'sapphire',
  streams: [ 
    {
      stream:formatOut 
    }, 
    {
      stream: logDNA,
      type: 'raw'
    }
  ]
});

module.exports = {
  core: logger.child({component: 'core'}),
  account: logger.child({component: 'account'}),
  db: logger.child({component: 'db'}),
  mq: logger.child({component: 'mq'}),
  job: logger.child({component: 'job'}),
  minerRepository: logger.child({component: 'minerRepository'}),
};