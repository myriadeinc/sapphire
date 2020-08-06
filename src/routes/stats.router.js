"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */

const AuthMiddleware = require("src/middleware/auth.middleware.js");
const MinerRepository = require("src/repository/miner.repository.js");
const HashRateModel = require("src/models/hashrate.model.js");
router.use('/', AuthMiddleware.validateMinerId);

/**
 * Last 24h: approx. 720 blocks
 */
router.get("/hashrates", async (req, res) => {
    const minerId = req.body.minerId;
    const rawRates = await MinerRepository.getRecentHashrates(minerId, 720);
    console.dir(rawRates)
    return res.status(200).send(rawRates);
});

/**
 * How to limit shares? They're very volatile and not very representative
 */
// router.get("/miner/shares", [], async (req, res) => {
//     const minerId = req.body.variables.minerId;
//     const rawShares = await MinerRepository.getRecentHashrates(minerId, 720);
//     return res.status(200).send(rawRates);
// });

router.get("/credit", async (req, res) => {
    const minerId = req.body.minerId;
    let minerInfo = await MinerRepository.getMinerDataById(minerId);
    minerInfo = minerInfo.credits
    return res.status(200).send(minerInfo);
});

/**
 * Authenticated miner locks funds that is related to a credit event
 */
router.post("/genfake", async (req, res) => {
    const minerId = req.body.minerId;
    console.dir(minerId);

    // let miner = await MinerRepository.getMiner(minerId);
    // await MinerRepository.grantMinerCredits(minerId, 5000);

//     for (let step = 0; step < 50; step++) {
//   await HashRateModel.upsert({
//         minerId,
//         time: Date.now(),
//         blockHeight: step,
//         rate: step*1000
//     })
// }
    


    return res.status(200).send("OK");
});

module.exports = router;