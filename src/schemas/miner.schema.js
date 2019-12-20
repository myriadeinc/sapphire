'use strict';
const {gql} = require('apollo-server');
const _ = require('lodash');
const MinerRepository = require('src/repository/miner.repository.js');
const LotteryRepository = require('src/repository/lottery.repository.js');
const LotteryService = require('src/service/lottery.service.js');

const MinerSchema = {
  typeDefs: gql(`
    type Hashrate {
      time: String!,
      rate: Int!
    }

    type MyriadeCredit {
      time: String!,
      credit: Int!
    }

    type Shares {
      share: Int,
      difficulty: Int,
      blockHeight: Int,
      time: String
    }

    type MinerData {
      id: ID!,
      monero_balance: String,
      myriade_credits(page: Int): [MyriadeCredit],
      hashrates(page: Int): [Hashrate],
      shares(start: String, end: String, page: Int): [Shares]
    }

    type LotteryDraw {
      pot: String,
      participants_count: Int,
      status: String,
      draw_time: String,
      previous_winner: String,
      in_draw(minerId: ID!): Boolean,
    }

    type Query {
      minerData(id: ID!): MinerData,
      lotteryDrawData: LotteryDraw,
    }

    type Mutation {
      participateInLottery(minerId: ID!): LotteryDraw
    }
  `),
  context: {
    miner_repository: MinerRepository,
    lottery_repository: LotteryRepository,
  },
  resolvers: {
    LotteryDraw: {
      status: (parent, args, context, info) => {
        return parent.is_active ? 'open' : 'closed';
      },
      participants_count: async (parent, args, context, info) => {
        const miners = await parent.getMiners();
        return miners.length;
      },
      in_draw: async (parent, args, context, info) => {
        const miners = await parent.getMiners();
        const res = _.filter(miners, {id: args.minerId});
        return 0 !== res.length;
      },
      previous_winner: (parent, args, context, info) => {
        return LotteryService.getLastWinner();
      },
    },
    MinerData: {
      hashrates: (parent, args, context, info) => {
        return context.miner_repository.getMinerHashrates(parent.id, args.page);
      },
      myriade_credits: (parent, args, context, info) => {
        return context.miner_repository.getMinerCredits(parent.id, args.page);
      },
      // shares: (parent, args, context, info) => {
      //   return null; // TO-DO!
      // }
    },
    Query: {
      minerData: (parent, args, context, info) => {
        return context.miner_repository.getMiner(args.id)
            .then((miner) => {
              return miner.toJSON();
            });
      },
      lotteryDrawData: (parent, args, context, info) => {
        return context.lottery_repository.getCurrentDraw();
      },
    },
    Mutation: {
      participateInLottery: (parent, args, context, info) => {
        return context.lottery_repository.addMinerToDraw(args.minerId, 0);
      },
    },
  },
};

module.exports = MinerSchema;
