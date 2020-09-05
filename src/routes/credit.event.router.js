"use strict";
/*eslint-disable */
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
/* eslint-enable */

const AuthMiddleware = require("src/middleware/auth.middleware.js");
const CreditEventService = require("src/service/credit.event.service.js");
const logger = require("src/util/logger.js").db;
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
      if (!mockMode) {
        const newCredits = CreditService.create(minerId, amount, req.body.lockType, req.body.comments);
      }

      const reply = {
        amount: req.body.amount,
        contentId: req.body.contentId,
        newBalance: '100000'
      }
      return res.status(200).send(reply);
    }
    catch (e) {
      return res.status(500).send("BAD CREDIT EVENT")
    }
  }
)

router.get("/active", AuthMiddleware.validateMinerId, async (req, res) => {
  try {
    // const entries = await CreditEventService.getCreditEvents(req.body.minerId);
    const eventTime = Date.now();
    const entries = {
      "entries": [
        {
          id: 1,
          amount: 100,
          lockType: 99,
          eventTime,
          contentId: 12

        },
        {
          id: 2,
          amount: 900,
          lockType: 98,
          eventTime,
          contentId: 47
        },
        {
          id: 3,
          amount: 400,
          lockType: 97,
          eventTime,
          contentId: 87
        }
      ]
    };
    return res.status(200).send(entries)
  }
  catch (e) {
    logger.error(e)
    return res.status(500).send('ERROR FETCHING CREDIT EVENTS')
  }
})
router.get("/won", AuthMiddleware.validateMinerId, async (req, res) => {
  try {
    // const entries = await CreditEventService.getCreditEvents(req.body.minerId, 1);
    const eventTime = Date.now();
    const entries = {
      "entries": [
        {
          id: 11,
          amount: 100,
          lockType: 99,
          eventTime,
          contentId: 120
        },
        {
          id: 12,
          amount: 900,
          lockType: 98,
          eventTime,
          contentId: 470
        },
        {
          id: 13,
          amount: 400,
          lockType: 97,
          eventTime,
          contentId: 870
        }
      ]
    };
    return res.status(200).send(entries)
  }
  catch (e) {
    logger.error(e)
    return res.status(500).send('ERROR FETCHING CREDIT EVENTS')
  }
})

// router.post(
//   "/check",
//   [
//     // username must be an email
//     check("username").isEmail(),
//     // password must be at least 5 chars long
//     check("password").isLength({ min: 5 }),
//   ],
//   async (req, res) => {
//     const minerId = req.body.variables.minerId;
//     if (!req.body.amount) {
//       return res.status(400).send("Amount not provided");
//     }
//     FundsService.lockFunds(req.body.amount);
//     return res.status(200).send("OK");
//   }
// );

module.exports = router;
