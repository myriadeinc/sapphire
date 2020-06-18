'use strict';
const axios = require('axios');

const MinerRepository = require('src/repository/miner.repository.js');
const SystemHashrateModel = require('src/models/system.hashrate.model.js');
const MinerModel = require("src/models/miner.model.js");

const logger = require('src/util/logger.js').core;
const DB = require("src/util/db.js");


const CreditService = {
    getBlockReward: async (blockHeight) => {
        const blockReward = await MoneroApi.getBlock(blockHeight).reward;
        return blockReward > 0 ? blockReward : 0;
    },
    // For latest network difficulty
    getNetworkDifficulty: () => {
        return 0;
    },
    hashrateToCredits: async (blockHeight) => {
        const systemInfo = await SystemHashrateModel.findByPk(blockHeight.toString(), { raw: true });
        const miners = await MinerRepository.getAllMinerHashrates(blockHeight);
        // Calculate miner credit based on formula, then update credit, wrap in transaction to ensure all miners receive their credits
        await DB.sequelize.transaction(async (t) => {
            await Promise.all(miners.map(async (miner) => {
                const credits = CreditService.creditConverter(miner.rate, systemInfo).toString();
                return MinerModel.increment({
                    credits: credits
                }, {
                    where: {
                        id: miner.minerId,
                    },
                    transaction: t
                });
            }));
        });
        return true;
    },

    creditConverter: (minerRate, systemInfo, strategy = "useMyriade") => {
        // Reward is saved as XMR atomic units (10^12)
        let finalCredit = 0n;
        switch (strategy) {
            // Calculate reward based on network hashrate
            case "useNetwork":
                finalCredit = 1000n
                break;
            // Calculate reward based on pool hashrate
            case "useSystem":
                finalCredit = 800n;
                break;
            // useMyriade is default for now, will change in the future
            default:
                finalCredit = (BigInt(systemInfo.reward) * BigInt(minerRate) * 9n) / (BigInt(systemInfo.poolRate) * 1000n)
        }
        return finalCredit;
    }



}

module.exports = CreditService;