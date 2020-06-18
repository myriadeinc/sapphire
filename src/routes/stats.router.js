"use strict";
/*eslint-disable */
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
/* eslint-enable */

const AuthMiddleware = require("src/middleware/auth.middleware.js");
const MinerRepository = require("../repository/miner.repository");
router.use('/CODERUNNER', AuthMiddleware.validateMinerId);
router.use('/miner', AuthMiddleware.validateMinerId);

/**
 * Last 24h: approx. 720 blocks
 */
router.get("/miner/hashrates", [], async (req, res) => {
    console.dir(req.body);
    const minerId = req.body.variables.minerId;
    const rawRates = await MinerRepository.getRecentHashrates(minerId, 720);
    return res.status(200).send(rawRates);
});

/**
 * Authenticated miner locks funds that is related to a credit event
 */
router.post("/test", [], async (req, res) => {
    console.dir(req.body);
    return res.status(200).send("OK");
});
module.exports = router;