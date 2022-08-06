"use strict";
const axios = require("axios");

const MinerRepository = require("src/repository/miner.repository.js");

const MinerModel = require("src/models/miner.model.js");

const CreditEventModel = require("src/models/credit.event.model.js");
const EventModel = require("src/models/event.cms.model.js");
const Op = require('sequelize').Op;
const logger = require("src/util/logger.js").core;
const DB = require("src/util/db.js");
const { QueryTypes } = require("sequelize");

const CreditEventService = {
  /**
   * Currently delayed
   * @description Since Diamond should manage XMR balance, we make an API call to transfer from credits -> XMR
   */
  depositFunds: async (minerId) => {
    return true;
  },

  create: async (minerId, amount, lockType, contentId, comments = "autoTriggered") => {
    const balance = await MinerRepository.minerCheckFunds(minerId, amount);
    if (balance < 0) {
      return false;
    }
    // if balance >=0
    await DB.sequelize.transaction(
      async (t) => {
        await MinerModel.update({
          credits: balance
        },
          {
            where: {
              id: minerId,
            },
          transaction: t
          })
        await CreditEventModel.create({
          minerId,
          status: 1,
          amount,
          lockType,
          eventTime: Date.now(),
          contentId,
          comments,
        }, { transaction: t });
      })
    return true;
  },

  closeEvent: async (eventId, winnerId) => {
    await CreditEventModel.update({ status: 1 }, { where: { id: eventId } })
    await CreditEventModel.update({ status: 10 }, { where: { minerId: winnerId } })
    return {}
  },
  
  grantMinerCredits: (minerId, amount) => MinerRepository.grantMinerCredits(minerId, amount),
  
  getParticipants: (eventId) => CreditEventModel.findAll({
    attributes: ["minerId"],
    where: { contentId: eventId },
    raw: true
  }),

  getUniqueParticipants: async (eventId) => {
    let participants = await CreditEventService.getParticipants(eventId);
    participants = participants.map(participant => participant.minerId.toString())
    return [...new Set(participants)]
  },

  getJoinedCreditEvents: async (minerId) => {
    const entries = await DB.sequelize.query('SELECT * FROM "Sapphire"."CreditEvents" a INNER JOIN "Sapphire"."EventCMS" b ON b.id = a."contentId" WHERE "minerId" = ?;', { 
      replacements: [minerId],
      type: QueryTypes.SELECT
    });

    return entries;
  },

  getCreditEvents: (minerId) => CreditEventModel.findAll({
    attributes: ["id", "amount", "lockType", "eventTime","contentId", "status"],
    where: {
      minerId
    }
  }),

  getTickets: (eventId) => CreditEventModel.findAll({
    attributes: ["amount"],
    where: { contentId: eventId }
  }),

  getPurchasedTickets: async (eventId) => {
    const tickets = await CreditEventService.getTickets(eventId);
    const event = await CreditEventService.getEvent(eventId);

    const ticketPrice = event.data.entryPrice ? event.data.entryPrice : 1;

    let numTickets = 0;
    tickets.forEach(ticket => {
      numTickets += (ticket.amount / ticketPrice);
    });

    return numTickets;
  },

  createEvent: async (data, tags = "default") => EventModel.create({ data, tags, status: 1 }),
  
  getEvent: (eventId) => EventModel.findOne({
    where: {id: eventId}
  }),

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
