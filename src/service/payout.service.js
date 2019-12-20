'use strict';

const MinerRepository = require('src/repository/miner.repository.js');
const moneroApi = require('src/api/monero.api.js');
const _ = require('lodash');
const logger = require('src/util/logger.js').core;
const DB = require("src/util/db.js");

const HashRateModel = require('src/models/hashrate.model.js');
const MyriadeCreditModel = require('src/models/credit.model.js');
const ShareModel = require('src/models/share.model.js');

/* Currently XMR block is approx. every 2 minutes which is good enough for our calculations, if there are any changes modify here */
let blockTime = 120;

const PayOutService = {

  getPoolHashrate: async (blockheight) => {
    
    let poolHashrate = 0n;
    let allShares = ShareModel.findAll({
      attributes: ['id', 'minerId', 'difficulty', 'share', 'time', 'blockHeight'],
      where: {
        blockHeight: blockheight,
      },
      order: [['time', 'DESC']]
    });

    _.reduce( allShares, (diificulty,share) => {
      poolHashrate += BigInt(share * difficulty);
    });
    /**
     * Multiply difficulty * share, sum then divide over timeInterval
     */
    return BigInt(poolHashrate / blockTime);
  },


  actionPayout: async (blockHeight) => {
    const now = Number(Date.now());
    const miners = await MinerRepository.getAllMiners();
    // Need to wrap all of it inside a DB transaction so that if one fails, all fails and DB
    //  performs a rollback to initial state. This provides strong guarantuee.
    await DB.sequelize.transaction(async (t) => {
      await Promise.all(miners.map( async (miner) => {

        let minerShares = await MinerRepository.getBlockShares(miner.id,blockHeight);

        if(_.isEmpty(minerShares)){
          return 0;
        }
        let rawHashrate = _.reduce(minerShares, (acc, share) => {
          return Number(acc + ( share.share * share.difficulty ) );
        }, 0);
        let minerHashrate = BigInt(Math.floor(rawHashrate/blockTime));
        
        console.dir("final hashrate : " + minerHashrate);
        // Updating Miner Hashrate
        await HashRateModel.create({
          minerId: miner.id,
          rate: minerHashrate,
          time: now,
        }, {transaction: t});

        let credits = await PayOutService.constantPayout(minerHashrate,blockHeight);

        await MyriadeCreditModel.create({
          minerID: miner.id,
          time: now,
          credit: BigInt(credits)
        }), {transaction: t};
      }));
    });

    return 1;
  },
    

    perBlockPayout: async (minerHashrate, blockHeight) => {
      let fullBlockReward = await moneroApi.getFullBlockReward(blockHeight);
      let credits = BigInt(10**7) * BigInt(fullBlockReward) * BigInt(minerHashrate/poolHashrate);

    },


    /**
     * 
     * 
     * @Note On Myriade credits to XMR: 1 XMR = 10^12 atomic units
     * Also, 1 XMR = 10^6 Myriade credit so 1 Myriade credit = 10^6 atomic units 
     * 0.9 * Myriade Credits -> 9 * 10^5 Atomic units
     */
    constantPayout: async (minerHashrate,blockHeight,useBaseReward=false) => {
      let networkHashRate = await moneroApi.getNetworkHashrate(blockHeight);
    
      let minerReward = BigInt(9n * (minerHashrate/networkHashRate));

      let blockReward = useBaseReward ? await moneroApi.getBaseBlockReward(blockHeight) : await moneroApi.getFullBlockReward(blockHeight);

      let credits = BigInt(BigInt(blockReward) / BigInt(10**5)) * BigInt(minerReward);
      
      return credits;
    }
}

module.exports = PayOutService;