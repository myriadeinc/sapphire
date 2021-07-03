"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */
const MinerMetricsService = require("src/service/miner.metrics.service.js");
const SystemHashrateModel = require("src/models/system.hashrate.model.js");
const StatsRepository = require("src/repository/stats.repository.js");

const HashrateModel = require("src/models/hashrate.model.js");
const cache = require('src/util/cache.js');
const CURR_POOL_INFO = 'currPoolInfo'

const Sequelize = require('sequelize');

const logger = require("src/util/logger.js").db;

router.get("/poolInfo",
    async (req, res) => {
        try {
            let currHeight = BigInt(MinerMetricsService.currentHeight.blockHeight) - 1n;
            currHeight = currHeight.toString()
            const poolData = await StatsRepository.getPoolStats(currHeight)
            let rate = Number(poolData.poolRateSum) / Number(poolData.hits)
            rate = Math.floor(rate)
            const nminers = poolData.nminers
            return res.status(200).send({
                "hashrate": rate || 0,
                "miner_count": nminers,
                "fee": "0% 5%",
                "block_height": currHeight,
                "last_block_found": "NEVER",
                "min_payout": 0.001
            });
        }
        catch (e) {
            logger.error(e);
            return res.status(500).send({ error: `Unable to fetch data for block ${currHeight}`, code: 500 });
        }
    });


module.exports = router;