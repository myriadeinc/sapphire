"use strict";


const logger = require("src/util/logger.js").core;
const cache = require('src/util/cache.js');

const NAMESPACE_POOL_DATA= 'poolData'

// poolData = {poolHashrate, nminers, blockHeight}
const StatsRepository = {

  savePoolStats: async (poolData) => {
    logger.info(`Attempting to sve poolData ${JSON.stringify(poolData)}`)
    let blockHeight = poolData.blockHeight.toString()
    await cache.put(blockHeight, poolData, NAMESPACE_POOL_DATA)
    // A little over a day 
    await cache.ttl(blockHeight, 90000, NAMESPACE_POOL_DATA)
  },

  getPoolStats: async (blockHeight) => {
    blockHeight = Number(blockHeight)
    try{
        let maxMiners = 0;
        let poolRateSum = 0;
        let hits = 0;
        for(let i = (blockHeight - 720) ; i <= blockHeight; i++ ){
            let data = await cache.get(i.toString(), NAMESPACE_POOL_DATA)
            if(data != null){
              let nminers = Number(data.nminers)
                if (i > (blockHeight - 10) && nminers > maxMiners) {maxMiners = nminers}
                hits++
                poolRateSum += Number(data.poolHashrate)
            }
        }
        return {
            nminers: maxMiners,
            poolRateSum,
            hits
        }

    }
    catch(e){
        logger.error(e)
        return {
          nminers: 0,
          poolRateSum: 0,
          hits: 0}
    }
    


  }

};

module.exports = StatsRepository;
