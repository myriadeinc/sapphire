'use strict';

const _ = require('lodash');

const testing = require('../test.init.js');
const cache = require('src/util/cache.js');
const StatsRepository = require("src/repository/stats.repository.js");

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-string'))
    .should();

describe('Stats Repository Func Tests', () => {
    
    before('Await DB', () => {
        return testing.cacheReady;
    });
    it('Should be able to save pool stats and fetch one', async () => {
        const poolData = {
            blockHeight: 1234567,
            nminers: 100,
            poolHashrate: 9999
        }
        StatsRepository.savePoolStats(poolData)
        let poolStats =  await StatsRepository.getPoolStats("1234567")
        poolStats.hits.should.be.equal(1);
        poolStats.nminers.should.be.equal(100);
        poolStats.poolRateSum.should.be.equal(9999);
    })

})