'use strict';

const MinerRepository = require('src/repository/miner.repository.js');
const SystemHashrateModel = require('src/models/system.hashrate.model.js');
const HashrateModel = require("src/models/hashrate.model.js");
const MoneroApi = require("src/api/monero.api.js");
const cache = require('src/util/cache.js');
const StatsRepository = require("src/repository/stats.repository.js");

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
    let nminers = 0;
    const blockInfo = await MoneroApi.getBlockInfoByHeight(blockHeight.toString(), forceCalc)

    let minerStats = await Promise.all(miners.map(async (miner) => {
      const minerShares = await MinerRepository.getBlockShares(miner.id, blockHeight);
      if (minerShares == null) return { id: miner.id, rate: 0n }
     
      const minerHashrate = minerShares.reduce((base, share) => {
        return base + (BigInt(share.share) * BigInt(share.difficulty));
      }, 0n) / 120n;
      // count active miners
      if(minerHashrate > 0n) { nminers++ }
      poolHashrate += minerHashrate;
      return { id: miner.id, rate: minerHashrate }
    })
    )
    minerStats.filter(miner => miner.rate != 0)


    // Need to wrap all of it inside a DB transaction so that if one fails, all fails and DB
    //  performs a rollback to initial state. This provides strong guarantuee.
    try {
      await DB.sequelize.transaction(async (t) => {
        // This is not the most accurate method of collecting pool hashrate, but we can always refresh via calling
        const reward = blockInfo.reward;
        const globalDiff = blockInfo.difficulty;
        logger.info(`Block ${blockHeight} info: reward is ${reward} \t diff is ${globalDiff}`);

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
      return null;
    }
    return {
      poolHashrate: poolHashrate.toString()
  , nminers, 
  blockHeight: blockHeight.toString()};
  },
  calculateForBlock: async (blockHeight) => {
    try {
      // Because BigInt isn't fully supported everywhere
      blockHeight = blockHeight.toString()
      logger.debug(`New BlockHeight detected, processing hashrate for last known blockHeight ${blockHeight}`)
      let poolData = await MinerMetricsService.convertSharesToHashrate(blockHeight);

      // Once we successfully convert shares to hashrate and get block info
      if (poolData == null) {
        logger.error("Convert shares to hashrate not successful")
        return false;
      }
      // Update credit balance for each miner
      await CreditService.hashrateToCredits(blockHeight);
      
      await StatsRepository.savePoolStats(poolData);
      
      MinerMetricsService.currentHeight.blockHeight = (BigInt(blockHeight) + 1n).toString();

    }
    catch (e) {
      logger.error(e)
      logger.error(`could not process hashrate for ${blockHeight}`)
      return false
    }
    logger.debug(`Converted hashrates to credits for blockHeight ${blockHeight}`)

    return true;

  },

  processData: async (data, forceCalc = false) => {
    try {
      // Because we are not syncing with Diamond, need to initialize if not exists
      const currMiner = await MinerRepository.getMiner(data.minerId);

      const result = await MinerRepository.insertShare(
        data.minerId,
        data.shares,
        data.difficulty,
        data.blockHeight,
        new Date(data.timestamp),
      );
      try {
        if (BigInt(data.blockHeight) > BigInt(MinerMetricsService.currentHeight.blockHeight)){
          MinerMetricsService.calculateForBlock(BigInt(MinerMetricsService.currentHeight.blockHeight))
          MinerMetricsService.currentHeight.blockHeight = BigInt(data.blockHeight)
        }


      } catch (e){
        logger.error(e)
        logger.error("tried to calculate new blockheight but failed")

      }
      

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
