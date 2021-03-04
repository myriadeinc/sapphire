"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */
const MinerMetricsService = require("src/service/miner.metrics.service.js");
const SystemHashrateModel = require("src/models/system.hashrate.model.js");
const ShareModel = require("src/models/share.model.js");

const logger = require("src/util/logger.js").db;

router.get("/poolInfo",
    async (req, res) => {
        try {
            const currHeight = Math.floor(parseInt(MinerMetricsService.currentHeight.blockHeight) /  10);
            const rate = await SystemHashrateModel.findByPk(currHeight.toString());
            const nminers = await ShareModel.count({
                distinct: true,
                col: "minerId",
                
                where: {
                blockHeight: currHeight,
            }});
            return res.status(200).send({
                "hashrate": rate && rate.poolRate,
                "miner_count": nminers,
                "fee": "5%",
                "block_height": currHeight,
                "last_block_found": "NEVER"
            });
        }
        catch (e) {
            logger.error(e);
            return res.status(500).send({ error: `Unable to fetch minerId: ${minerId}`, code: 500 });
        }
    });


module.exports = router;