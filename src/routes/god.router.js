"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */
const { check, validationResult } = require("express-validator");
const AuthMiddleware = require("src/middleware/auth.middleware.js");
const CreditEventService = require("src/service/credit.event.service.js");
const MinerMetricsService = require("src/service/miner.metrics.service.js");

const logger = require("src/util/logger.js").core;

router.get("/participants/:id", AuthMiddleware.authenticateGodMode, async (req, res) => {
    const eventId = req.params.id;
    const participantIds = await CreditEventService.getUniqueParticipants(eventId)
    return res.status(200).send({
        participantIds
    })
})

// Webhook to trigger refresh update
router.get("/refresh", async (req, res)=> {
    const blockHeight = req.query.block;
    if(!blockHeight){
        return res.sendStatus(422)
    }
    const result = MinerMetricsService.calculateForBlock(BigInt(blockHeight)-1n)
    return result ? res.sendStatus(200) : res.sendStatus(500)
})


router.post("/grantCredits", [
    check("minerId").exists(),
    check("awardAmount").exists(),
], AuthMiddleware.authenticateGodMode, async (req, res) => {
    const minerId = req.body.minerId;
    const awardAmount = req.body.awardAmount;

    let result = { success: false }
    try {
        result = await CreditEventService.grantMinerCredits(awardAmount);
    }
    catch (err) {
        logger.error(err)
    }
    return res.status(200).send({ result })
})

router.post("/closeEvent", [
    check("eventId").exists(),
    check("winnerId").exists(),
], AuthMiddleware.authenticateGodMode, async (req, res) => {
    const eventId = req.body.eventId;
    const winner = req.body.winnerId;
    let result = { success: false }
    try {
        result = await CreditEventService.closeEvent(eventId, winnerId)
        result.success = true;
    }
    catch (err) {
        logger.error(err)
    }

    return res.status(200).send({ result })
})

router.post("/forceRegister", [
    check("eventId").exists(),
    check("minerId").exists(),
], AuthMiddleware.authenticateGodMode, async (req, res) => {
    const eventId = req.body.eventId;
    const minerId = req.body.minerId;
    let result = { success: false }
    try {
        await CreditEventService.grantMinerCredits(minerId, 10)
        result = await CreditEventService.create(minerId, 10, 1, eventId)
        result.success = true
    }
    catch (err) {
        logger.error(err)
    }
    return res.status(200).send({ result })
})


module.exports = router;