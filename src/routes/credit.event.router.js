"use strict";
/*eslint-disable */
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
/* eslint-enable */

const AuthMiddleware = require("src/middleware/auth.middleware.js");
const CreditEventService = require("src/service/credit.event.service.js");
const MinerRepository = require("src/repository/miner.repository.js");
const logger = require("src/util/logger.js").db;
const { getMinerDataById } = require("src/repository/miner.repository");


/**
 * Authenticated miner locks funds that is related to a credit event
 */
router.post(
  "/buy",
  [check("amount").exists(),
  check("contentId").exists()
  ], AuthMiddleware.validateMinerId,
  async (req, res) => {
    try {
      const minerId = req.body.minerId
      const amount = req.body.amount
      const lockType = 10; // This is set temporarily

      if (amount < 1) {
        return res.status(406).send({
          error: `Insufficient purchase amount ${amount}`,
          code: 406
        })
      }

      const txSucceeds = await CreditEventService.create(minerId, amount, lockType, req.body.contentId, req.body.comments)
      if (!txSucceeds) {
        logger.error(`Insufficient funds for purchase amount ${amount}`);
        return res.status(406).send({
          error: `Insufficient funds for purchase amount ${amount}`,
          code: 406
        });
      }

      const miner = await getMinerDataById(minerId);
      const reply = {
        amount,
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
    let entries = await CreditEventService.getJoinedCreditEvents(req.body.minerId);

    entries = entries.map(entry => {
      const data = entry.data;

      return {
        title: data.title,
        tickets: entry.amount / data.entryPrice,
        amount: data.prizeAmount,
        purchased: new Date(entry.eventTime).getTime() / 1000,
        winner: data.winner ? `Miner #${data.winner}` : '-',
        status: entry.status,
        contentId: entry.contentId
      };
    });

    return res.status(200).send(entries);
  }
  catch (e) {
    logger.error(e)
    return res.status(500).send({ error: 'ERROR FETCHING CREDIT EVENTS', code: 500 })
  }
})

module.exports = router;
