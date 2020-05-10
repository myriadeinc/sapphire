'use strict';
const axios = require('axios');

const MinerRepository = require('src/repository/miner.repository.js');

const logger = require('src/util/logger.js').core;
const DB = require("src/util/db.js");


const PayOutService = {
    getBaseBlockreward: () => {
      return 0;
    },
    getFullBlockReward: (blockHeight) => {
      return 0;
    },
    getNetworkHashrate: () => {
        axios.get().then(()=> {
            return 10;
        });
    },


    actionPayout: async (blockHeight) => {
    const now = Date.now();
    const miners = await MinerRepository.getAllMiners();
    let poolHashrate = 0;
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
          credit: this.constantFeePayout(minerHashrate,blockHeight)
        }), {transaction: t};
      }));
    });

    },
    /**
     * Calculate reward for each miner based on set fee
     */
    constantPayout: async() => {},
    constantFeePayout: async () => {}
}

module.exports = PayOutService;