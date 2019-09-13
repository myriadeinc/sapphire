'use strict';

const redis = require('promise-redis');

let redisClient;

const Cache = {

  init: (conf) => {
    redisClient = redis.createClient(conf);
  },

  parse: (rawString) => {
    let val = rawString;
    try {
      val = JSON.parse(val);
    } catch (err) {}
    return val;
  },

  stringify: (value) => {
    let val = value;
    if (!_.isString(val)) {
      val = JSON.stringify(val);
    }
    return val;
  },

  put: (key, value) => {
    return redisClient.set(key, Cache.stringify(value));
  },

  get: (key) => {
    return redisClient.get(key)
        .then((res) => {
          return Cache.parse(res);
        });
  },
  close: () => {
    redisClient.quit();
  },
};

module.exports = Cache;
