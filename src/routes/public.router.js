"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */
const MinerMetricsService = require("src/service/miner.metrics.service.js");
const SystemHashrateModel = require("src/models/system.hashrate.model.js");
const HashrateModel = require("src/models/hashrate.model.js");

const logger = require("src/util/logger.js").db;

router.get("/poolInfo",
    async (req, res) => {
        try {
            const currHeight = BigInt(MinerMetricsService.currentHeight.blockHeight) - 1n;
            const rate = await SystemHashrateModel.findByPk(currHeight.toString());
            const nminers = await HashrateModel.count({
                distinct: true,
                col: "minerId",
                where: {
                    blockHeight: currHeight.toString(),
                }
            });
            return res.status(200).send({
                "hashrate": rate && rate.poolRate,
                "miner_count": nminers,
                "fee": "5%",
                "block_height": currHeight.toString(),
                "last_block_found": "NEVER"
            });
        }
        catch (e) {
            logger.error(e);
            return res.status(500).send({ error: `Unable to fetch data for block ${currHeight}`, code: 500 });
        }
    });


module.exports = router;