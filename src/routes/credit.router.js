"use strict";
/*eslint-disable */
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
/* eslint-enable */

const AuthMiddleware = require("src/middleware/auth.middleware.js");
const CreditEventService = require("src/service/credit.event.service.js");

/**
 * Authenticated miner locks funds that is related to a credit event
 */
router.post(
  "/buy",
  [
    // username must be an email
    check("username").isEmail(),
    // password must be at least 5 chars long
    check("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const minerId = req.body.variables.minerId;
    if (!req.body.amount) {
      return res.status(400).send("Amount not  provided");
    }
    CreditService.lockFunds(req.body.amount);
    return res.status(200).send("OK");
  }
);

/**
 * Authenticated miner locks funds that is related to a credit event
 */
router.post("/CODERUNNER", [], async (req, res) => {
  console.dir(req.body);
  const result = await CreditEventService.runIt();
  return res.status(200).send("OK");
});

/**
 * Authenticated miner checks to see which credit events they are currently involved in
 */
router.get("/check", async (req, res) => {
  const minerId = req.body.variables.minerId;
  res.status(200).send('ok')
});

/**
 * Admin registers a payout of a certain amount to the miner
 */
router.post(
  "/check",
  [
    // username must be an email
    check("username").isEmail(),
    // password must be at least 5 chars long
    check("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const minerId = req.body.variables.minerId;
    if (!req.body.amount) {
      return res.status(400).send("Amount not provided");
    }
    FundsService.lockFunds(req.body.amount);
    return res.status(200).send("OK");
  }
);

module.exports = router;
