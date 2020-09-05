"use strict";
const axios = require("axios");

const MinerRepository = require("src/repository/miner.repository.js");

const MinerModel = require("src/models/miner.model.js");
const HashRateModel = require("src/models/hashrate.model.js");
const ShareModel = require("src/models/share.model.js");
const CreditEventModel = require("src/models/credit.event.model.js");
const EventModel = require("src/models/event.cms.model.js");
const Op = require('sequelize').Op;
const logger = require("src/util/logger.js").core;
const DB = require("src/util/db.js");

const CreditEventService = {
  /**
   * Currently delayed
   * @description Since Diamond should manage XMR balance, we make an API call to transfer from credits -> XMR
   */
  depositFunds: async (minerId) => {
    return true;
  },
  create: async (minerId, amount, lockType, comments = null) => {
    const balance = await MinerRepository.minerCheckFunds(minerId, amount);
    if (balance < 0) {
      throw new Error("Insufficient funds!")
    }
    // if balance >=0
    await DB.sequelize.transaction(
      async (t) => {
        await MinerRepository.updateMinerFunds(minerId, balance);
        await CreditEventModel.create({
          minerId,
          status: 1,
          amount,
          lockType,
          eventTime: new Date(),
          comments,
        });
      },
      { transaction: t }
    );
  },
  getCreditEvents: (minerId, status = 0) => CreditEventModel.find({
    where: {
      minerId,
      status
    }
  }),

  createEvent: async (data, tags = "default") => EventModel.create({ data, tags, status: 1 }),
  getActiveContent: () => EventModel.findAll({ where: { status: 1 } }),

  keyReference: {
    lockType: {
      0: "XMR PAYOUT",
      1: "TIME LOCKED RAFFLE",
      2: "INSTANT RAFFLE",
      3: ""
    },
    status: {},

  }
};

module.exports = CreditEventService;
