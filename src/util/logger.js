'use strict';
const bunyan = require('bunyan');
const bformat = require('bunyan-formatter')
  ; const formatOut = bformat({outputMode: 'short', level: 'debug'});

// Later for production we can use LogDNA on the Bunyan stream

const logger = bunyan.createLogger({
  name: 'sapphire',
  stream: formatOut,
});

module.exports = {
  core: logger.child({component: 'core'}),
  account: logger.child({component: 'account'}),
  db: logger.child({component: 'db'}),
  mq: logger.child({component: 'mq'}),
  job: logger.child({component: 'job'}),
};
