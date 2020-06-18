"use strict";
const axios = require("axios");

const MinerRepository = require("src/repository/miner.repository.js");

const MinerModel = require("src/models/miner.model.js");
const HashRateModel = require("src/models/hashrate.model.js");
const ShareModel = require("src/models/share.model.js");
const CreditEventModel = require("src/models/credit.event.model.js");
const EventModel = require("src/models/event.cms.model.js");

const logger = require("src/util/logger.js").core;
const DB = require("src/util/db.js");

const CreditEventService = {
  create: async (minerId, amount, lockType, comments = null) => {
    const balance = await MinerRepository.minerCheckFunds(minerId, amount);
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
  /**
   * @description Since Diamond should manage XMR balance, we make an API call to transfer from credits -> XMR
   */
  depositFunds: async (minerId) => {
    // DiamondApi.updateXMR(amount)
    return true;
  },
  createEvent: async (data) => { },
  runIt: async () => { },
};

module.exports = CreditEventService;
