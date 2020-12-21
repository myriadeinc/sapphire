"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */
const jwt = require("jsonwebtoken");
const AuthMiddleware = require("src/middleware/auth.middleware.js");
const MinerRepository = require("src/repository/miner.repository.js");
const HashRateModel = require("src/models/hashrate.model.js");
const logger = require("src/util/logger.js").db;

router.use(AuthMiddleware.validateMinerId);

/**
 * Last 24h: approx. 720 blocks
 */
router.get("/hashrates",
    AuthMiddleware.validateMinerId,
    async (req, res) => {
        const minerId = req.body.minerId;
        try {
            const limit = Math.min(req.query.limit, 720) || 720;
            const rawRates = await MinerRepository.getRecentHashrates(minerId, limit);
            return res.status(200).send(rawRates);
        }
        catch (e) {
            logger.error(e);
            return res.status(500).send({ error: `Unable to fetch minerId: ${minerId}`, code: 500 });
        }
    });

router.get("/credit", async (req, res) => {
    const minerId = req.body.minerId;
    try {
        const minerInfo = await MinerRepository.getMinerDataById(minerId);
        return res.status(200).send({ credits: minerInfo.credits });
    }
    catch (e) {
        logger.error(e);
        return res.status(500).send({ error: `Unable to fetch minerId: ${minerId}`, code: 500 });
    }
});

router.get("/fakeData", async (req, res) => {
    const minerId = req.body.minerId || req.body.accountId;
    let miner = await MinerRepository.getMiner(minerId);
    await MinerRepository.grantMinerCredits(minerId, 5000);
    for (let step = 0; step < 50; step++) {
        await HashRateModel.upsert({
            minerId,
            time: Date.now(),
            blockHeight: step,
            rate: step * Math.round(Math.random() * 10)
        })
    }
    return res.status(200).send({ done: true });
});

module.exports = router;