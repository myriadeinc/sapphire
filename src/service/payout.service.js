'use strict';
const axios = require('axios');

const MinerRepository = require('src/repository/miner.repository.js');
const moneroApi = require('src/api/monero.api.js');

const logger = require('src/util/logger.js').core;
const DB = require("src/util/db.js");


const PayOutService = {

  getPoolHashrate: async (blockheight) => {
    const now = Date.now();
    let poolHashrate = 0;
    let allShares = ShareModel.findAll({
      attributes: ['id', 'minerId', 'difficulty', 'share', 'time', 'blockHeight'],
      where: {
        blockHeight: blockheight,
      },
      order: [['time', 'DESC']]
    });
    const last = allShares[allShares.length -1].time;
    const timeInterval = now/last;
    _.reduce( allShares, (diificulty,share) => {

    });
    /**
     * multiply difficulty * share, sum then divide over timeInterval
     */
  },


    actionPayout: async (blockHeight) => {
    const now = Date.now();
    const miners = await MinerRepository.getAllMiners();

    // Need to wrap all of it inside a DB transaction so that if one fails, all fails and DB
    //  performs a rollback to initial state. This provides strong guarantuee.
    await DB.sequelize.transaction(async (t) => {
      await Promise.all(miners.map( async (miner) => {
        let minerShares = await MinerRepository.getBlockShares(miner.id,blockHeight);
        const last = minerShares[minerShares.length -1].time;
        let minerHashrate = _.reduce(minerShares, (acc, share) => {
          return acc + ( (share.share * share.difficulty) / (now - last) );
        }, 0);
        
        // Updating Miner Hashrate
        await HashRateModel.create({
          minerId: miner.id,
          rate: minerHashrate,
          time: now,
        }, {transaction: t});
        
        poolHashrate += minerHashrate;

        await CreditModel.create({
          minerID: miner.id,
          time: now,
          credit: this.constantPayout(minerHashrate,blockHeight)
        }), {transaction: t};
      }));
    });

    },

    perBlockPayout: async (minerHashrate, blockHeight) => {
      let fullBlockReward = await moneroApi.getFullBlockReward(blockHeight);
      let credits = 10**7n * BigInt(fullBlockReward) * BigInt(minerHashrate/poolHashrate);

    },

    constantPayout: async (minerHashrate,blockHeight,useBaseReward=false) => {
      let networkHashRate = await moneroApi.getNetworkHashrate(blockHeight);
      let fullBlockReward = await moneroApi.getFullBlockReward(blockHeight);

      if(baseReward){
        let getBaseBlockreward = await moneroApi.getBaseBlockReward(blockHeight);
        let credits = 10**7n * BigInt(baseBlockReward) * BigInt(minerHashrate/networkHashRate);
        return credits;
      }
      let credits = 10**7n * BigInt(fullBlockReward) * BigInt(minerHashrate/networkHashRate);
      
      return credits;


    }
}

module.exports = PayOutService;