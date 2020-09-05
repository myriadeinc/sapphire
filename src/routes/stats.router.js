"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */
const jwt = require("jsonwebtoken");
const AuthMiddleware = require("src/middleware/auth.middleware.js");
const MinerRepository = require("src/repository/miner.repository.js");
const HashRateModel = require("src/models/hashrate.model.js");

router.use(AuthMiddleware.validateMinerId);

/**
 * Last 24h: approx. 720 blocks
 */
router.get("/hashrates",
    AuthMiddleware.validateMinerId,
    async (req, res) => {

        const minerId = req.body.minerId;
        const rawRates = await MinerRepository.getRecentHashrates(minerId, 720);

        return res.status(200).send(rawRates);
    });

router.get("/credit", async (req, res) => {
    const minerId = req.body.minerId;
    let minerInfo = await MinerRepository.getMinerDataById(minerId);
    minerInfo = minerInfo.credits
    return res.status(200).send(minerInfo);
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