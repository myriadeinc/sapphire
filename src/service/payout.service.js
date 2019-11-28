'use strict';
const axios = require('axios');

const MinerRepository = require('src/repository/miner.repository.js');

const logger = require('src/util/logger.js').core;
const DB = require("src/util/db.js");

const PayOutService = {
    getNetworkHashrate: () => {
        axios.get().then(()=> {

            return 10;
        });
    },

    perBlockPayout: async () => {

    const now = Date.now();

    const miners = await MinerRepository.getAllMiners();
    let poolHashrate = 0;

    // Need to wrap all of it inside a DB transaction so that if one fails, all fails and DB
    //  performs a rollback to initial state. This provides strong guarantuee.
    await DB.sequelize.transaction(async (t) => {
      await Promise.all(miners.map( async (miner) => {

        let minerShares = await MinerRepository.getUncalculatedShares(miner.id);
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
        
        // Updates every shares to be is_calculated
        await Promise.all(minerShares.map(share => {
          return share.update({
            is_calculated: true
          }, {transaction: t});
        }))
        poolHashrate += minerHashrate;

      }));
    });
    return poolHashrate;


    },
    /**
     * Calculate reward for each miner based on set fee
     */
    constantPayout: async () => {
        let networkHashrate = this.getNetworkHashrate();
        let blockReward = this.getBaseBlockreward();

        await DB.sequelize.transaction(async (t) => {
            await Promise.all(miners.map( async (miner) => {
                let minerShares = await MinerRepository.getUncalculatedShares(miner.id);
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

            let credit = minerHashrate / networkHashrate * 10**7 * 0.9 * blockReward;
            await CreditModel.create({
                minerId: miner.id,
                credit: credit,


                time: now
            });
            // Updates every shares to be is_calculated
            await Promise.all(minerShares.map(share => {
              return share.update({
                is_calculated: true
              }, {transaction: t});
            }))

            await Promise.all(miners.map(async (miner) => {
                return miner.cre



                }
            ));

            }));
        });



    },
    constantFeePayout: async () => {}
}

module.exports = PayOutService;