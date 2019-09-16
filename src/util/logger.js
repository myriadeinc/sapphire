'use strict';
const bunyan = require('bunyan')
, bformat = require('bunyan-formatter')  
, formatOut = bformat({ outputMode: 'short', level: 'debug'});

// Later for production we can use LogDNA on the Bunyan stream

const logger = bunyan.createLogger({
  name: 'sapphire',
  stream: formatOut
});

module.exports = {
  core: logger.child({component: 'core'}),
  account: logger.child({component: 'account'}),
};
