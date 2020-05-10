'use strict';
const bunyan = require('bunyan')
, bformat = require('bunyan-formatter')  
, formatOut = bformat({ outputMode: 'short', level: 'debug'});

const config = require('src/util/config.js');

let LogDNAStream = require('logdna-bunyan').BunyanStream;

let streams = [];
streams.push({stream: formatOut });
if(config.get('log:logdna_api_token')){
  streams.push({
    stream: new LogDNAStream({
      key: config.get('log:logdna_api_token')
    }),
    type: 'raw'
  })
}

const logger = bunyan.createLogger({
  name: 'emerald',
  streams
});

module.exports = {
  core: logger.child({component: 'core'}),
  account: logger.child({component: 'account'}),
  db: logger.child({component: 'db'}),
  mq: logger.child({component: 'mq'}),
  job: logger.child({component: 'job'}),
  minerRepository: logger.child({component: 'minerRepository'}),
};