'use strict';
const axios = require('axios');

const MinerRepository = require('src/repository/miner.repository.js');
const SystemHashrateModel = require('src/models/system.hashrate.model.js');
const MinerModel = require("src/models/miner.model.js");
const MoneroApi = require("src/api/monero.api.js");
const logger = require('src/util/logger.js').core;
const DB = require("src/util/db.js");


const CreditService = {
    hashrateToCredits: async (blockHeight) => {
        const systemInfo = await SystemHashrateModel.findByPk(blockHeight.toString(), { raw: true });
        const miners = await MinerRepository.getAllMinerHashrates(blockHeight);
        // Calculate miner credit based on formula, then update credit, wrap in transaction to ensure all miners receive their credits
        await DB.sequelize.transaction(async (t) => {
            await Promise.all(miners.map(async miner => {
                const minerModel = await MinerRepository.getMiner(miner.minerId);
                const credits = CreditService.creditConverter(miner.rate, systemInfo, "useMyriade", minerModel).toString();
                return MinerRepository.grantMinerCredits(miner.minerId, credits, t)
            }))
        })
        return true;
    },

    creditConverter: (minerRate, systemInfo, strategy = "useMyriade", miner) => {
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
                const ppsRatio = miner ? miner.pps_ratio : 0;
                const preSplit = BigInt(systemInfo.reward) * BigInt(minerRate);
                const xmrPart = preSplit * BigInt(ppsRatio) / 100n;
                const mcPart = preSplit - xmrPart;

                finalCredit = (mcPart * 9n) / ((BigInt(systemInfo.globalDiff) / 120n) * 1000000n);
                if (ppsRatio > 0) {
                    const xmrCredit = (xmrPart * 97n) / ((BigInt(systemInfo.globalDiff) / 120n) * 100n);
                    // console.log(`Logging spread for split user ${miner.id}`);
                    // console.log(finalCredit);
                    // console.log(xmrCredit);
                    let monero_balance = BigInt(miner.monero_balance);
                    monero_balance += xmrCredit;
                    MinerRepository.updateMiner(miner.id, { monero_balance });
                }
        }
        return finalCredit;
    }



}

module.exports = CreditService;