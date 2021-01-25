'use strict';

const MinerRepository = require('src/repository/miner.repository.js');
const SystemHashrateModel = require('src/models/system.hashrate.model.js');
const HashrateModel = require("src/models/hashrate.model.js");
const ShareModel = require('src/models/share.model.js');
const MoneroApi = require("src/api/monero.api.js");

const CreditService = require('src/service/credit.service.js');
const mq = require('src/util/mq.js');

const logger = require('src/util/logger.js').core;
const DB = require('src/util/db.js');

const MinerMetricsService = {
  currentHeight: {
    blockHeight: 0,
    locked: false
  },

  convertSharesToHashrate: async (blockHeight, forceCalc = false) => {
    // Get all the shares for a given block, then we convert them to approx. hashrate (which is [total difficulty * share count] / 120s)
    const miners = await MinerRepository.getAllMiners();
    const time = Date.now();
    let poolHashrate = 0n;
    const minerStats = await Promise.all(miners.map(async (miner) => {
            const minerShares = await MinerRepository.getBlockShares(miner.id,blockHeight);
            if (minerShares.length == 0) return { id: miner.id, rate: 0n }
            const minerHashrate = minerShares.reduce((base, share) => {
              return base + (BigInt(share.share) * BigInt(share.difficulty));
            }, 0n) / 120n;
            poolHashrate+=minerHashrate;
            return { id: miner.id, rate: minerHashrate}
          })
    )
    logger.info(`Pool Hashrate for block ${blockHeight} at ${poolHashrate}`)
    // Need to wrap all of it inside a DB transaction so that if one fails, all fails and DB
    //  performs a rollback to initial state. This provides strong guarantuee.
    try {
      await DB.sequelize.transaction(async (t) => {
        // This is not the most accurate method of collecting pool hashrate, but we can always refresh via calling
        const blockInfo = await MoneroApi.getBlockInfoByHeight(blockHeight.toString(), forceCalc)
        const reward = blockInfo.reward;
        const globalDiff = blockInfo.difficulty;
        logger.info(`Block info: reward is ${reward} \t diff is ${globalDiff}`);

        await Promise.all(minerStats.map(miner => 
          HashrateModel.upsert(
            {
              minerId: miner.id,
              rate: miner.rate,
              time,
              blockHeight,
            },
            {
              transaction: t,
              where: {
                minerId: miner.id,
                blockHeight
              }
          })));

        await SystemHashrateModel.upsert({
            blockHeight,
            poolRate: poolHashrate,
            reward,
            globalDiff,
          }, {
            where: {
              blockHeight
            },
            transaction: t
          });
        
      })
    }
    catch (e) {
      logger.error("Could not update all shares into hashrates")
      logger.error(e)
      return false;
    }
    return true;
  },
  calculateForBlock: async (blockHeight) => {
   try{
     // Because BigInt isn't fully supported everywhere
     blockHeight = blockHeight.toString()
      logger.info(`New BlockHeight detected, processing hashrate for last known blockHeight ${blockHeight}`)
      const success = await MinerMetricsService.convertSharesToHashrate(blockHeight);
      
      // Once we successfully convert shares to hashrate and get block info
      if (!success) {
        logger.error("Convert shares to hashrate not successful")
        return false;
      }
      // Update credit balance for each miner
      await CreditService.hashrateToCredits(blockHeight);
      MinerMetricsService.currentHeight.blockHeight = (blockHeight+1n).toString();
      
   }
   catch(e){
     logger.error(e)
     return false
   }
   return true;
  
  },

  processData: async (data, forceCalc = false) => {
    try {
      // Because we are not syncing with Diamond
      const currMiner = await MinerRepository.getMiner(data.minerId);
      const result = await MinerRepository.insertShare(
        data.minerId,
        data.shares,
        data.difficulty,
        data.blockHeight,
        new Date(data.timestamp),
      );
      
    } catch (err) {
      logger.error(err);
      return 0;
    }
    return 1;
  },

  init: (blockHeight) => {
    MinerMetricsService.currentHeight.blockHeight = blockHeight || 0;
    logger.info(`Miner Metrics initiating with block height ${blockHeight}`)
    return mq.registerConsumer(MinerMetricsService.processData);
  },
};

module.exports = MinerMetricsService;
