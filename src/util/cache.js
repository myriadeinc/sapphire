'use strict';

const redis = require('promise-redis')();
const _ = require('lodash');

let redisClient;

const Cache = {
    test: () => "asd",

    init: (conf) => {
        redisClient = redis.createClient(conf);
    },

    parse: (rawString) => {
        let val = rawString;
        try {
            val = JSON.parse(val);
        } catch (err) { }
        return val;
    },

    stringify: (value) => {
        let val = value;
        if (!_.isString(val)) {
            val = JSON.stringify(val);
        }
        return val;
    },

    put: (key, value, namespace = '') => {
        const prefixed_key = `${namespace}::${key}`;
        return redisClient.set(prefixed_key, Cache.stringify(value));
    },

    incrBy: (key, value, namespace = '') => {
        const prefixed_key = `${namespace}::${key}`;
        return redisClient.incrby(prefixed_key, Cache.stringify(value));
    },

    get: (key, namespace = '') => {
        const prefixed_key = `${namespace}::${key}`;
        return redisClient.get(prefixed_key)
            .then((res) => {
                return Cache.parse(res);
            });
    },
    clear: () => redisClient.flushall(),
    close: () => {
        redisClient.quit();
    },
};

module.exports = Cache;
