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
            // Stop when no shares exist
            if (minerShares.length == 0) return { id: miner.id, rate: 0n }
            // Hashrate must be saved as BigInt since difficulty can later grow to large numbers
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
        if(poolHashrate <= 0n) throw new Error(`Pool Hashrate too low at ${poolHashrate}`)

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
        await ShareModel.update({ status: 1 }, {
          where: {
            blockHeight,
            status: 0
            },
          transaction: t
        })
      })
    }
    catch (e) {
      logger.error("Could not update all shares into hashrates")
      logger.error(e)
    }
    return poolHashrate == 0n;
  },

  processData: async (data, forceCalc = false) => {
    try {
      const currMiner = await MinerRepository.getMiner(data.minerId);
      // Skip stale shares
      if (data.blockHeight < MinerMetricsService.currentHeight.blockHeight && !forceCalc) return 0;
      
      await MinerRepository.insertShare(
        data.minerId,
        data.shares,
        data.difficulty,
        data.blockHeight,
        new Date(data.time),
      );
      const currentHeight = BigInt(MinerMetricsService.currentHeight.blockHeight);
      if (currentHeight < BigInt(data.blockHeight) && !MinerMetricsService.currentHeight.locked) {
        logger.info(`New BlockHeight detected, processing hashrate for blockHeight ${currentHeight}`)
        const success = await MinerMetricsService.convertSharesToHashrate(currentHeight);
        MinerMetricsService.currentHeight.locked = true;
        // Once we successfully convert shares to hashrate and get block info
        if (!success) {
          logger.error("Convert shares to hashrate not successful")
          return 2;
        }
        // Update credit balance for each miner
        await CreditService.hashrateToCredits(currentHeight);
        MinerMetricsService.currentHeight.blockHeight = data.blockHeight;
        MinerMetricsService.currentHeight.locked = false;
        return 3;
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
