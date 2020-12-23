"use strict";
/*eslint-disable */
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
/* eslint-enable */

const AuthMiddleware = require("src/middleware/auth.middleware.js");
const CreditEventService = require("src/service/credit.event.service.js");
const MinerRepository = require("src/repository/miner.repository.js");
const logger = require("src/util/logger.js").db;
const { getMinerDataById } = require("../repository/miner.repository");
const mockMode = true;

/**
 * Authenticated miner locks funds that is related to a credit event
 */
router.post(
  "/buy",
  [check("amount").exists(),
  check("lockType").exists(),
  check("contentId").exists()
  ], AuthMiddleware.validateMinerId,
  async (req, res) => {
    try {
      const minerId = req.body.minerId
      const amount = req.body.amount

      const txSucceeds = CreditEventService.create(minerId, amount, req.body.lockType, req.body.contentId, req.body.comments)
      if (!txSucceeds) {
        logger.error(`Insufficient funds for purchase amount ${amount}`);
        return res.status(406).send({
          error: `Insufficient funds for purchase amount ${amount}`,
          code: 406
        });
      }

      const miner = await getMinerDataById(minerId);
      const reply = {
        amount: req.body.amount,
        contentId: req.body.contentId,
        newBalance: miner.credits
      }

      return res.status(200).send(reply);
    }
    catch (e) {
      logger.error(e);
      return res.status(500).send({ error: 'BAD CREDIT EVENT', code: 500 })
    }
  }
)

router.get("/allEvents", AuthMiddleware.validateMinerId, async (req, res) => {
  try {
    const entries = await CreditEventService.getCreditEvents(req.body.minerId);
    // const eventTime = Date.now();
    // const entries = {
    //   "entries": [
    //     {
    //       id: 1,
    //       amount: 100,
    //       lockType: 99,
    //       eventTime,
    //       "purchaseTime": 1603328809963,
    //       contentId: 12,
    //       status: "WON"
    //     },
    //     {
    //       id: 2,
    //       amount: 900,
    //       lockType: 98,
    //       eventTime,
    //       "purchaseTime": 1503328809963,
    //       contentId: 47,
    //       status: "PENDING"
    //     },
    //     {
    //       id: 3,
    //       amount: 400,
    //       lockType: 97,
    //       eventTime,
    //       "purchaseTime": 1603328109963,
    //       contentId: 87,
    //       status: "LOST"
    //     }
    //   ]
    // };
    return res.status(200).send(entries)
  }
  catch (e) {
    logger.error(e)
    return res.status(500).send({ error: 'ERROR FETCHING CREDIT EVENTS', code: 500 })
  }
})

module.exports = router;
