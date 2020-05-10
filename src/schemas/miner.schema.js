'use strict';
const {gql} = require('apollo-server');
const _ = require('lodash');
const MinerRepository = require('src/repository/miner.repository.js');

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

    type ShareData {
      share: Int,
      time: String,
      difficulty: Int,
    }

    type MinerData {
      id: ID!,
      monero_balance: String,
      myriade_credits(page: Int): [MyriadeCredit],
      hashrates(page: Int): [Hashrate],
      shares: [ShareData]
    }

    type Query {
      minerData(id: ID!): MinerData
    }

  `),
  context: {
    miner_repository: MinerRepository,
    
  },
  resolvers: {
    MinerData: {
      hashrates: (parent, args, context, info) => {
        return context.miner_repository.getMinerHashrates(parent.id, args.page);
      },
      myriade_credits: (parent, args, context, info) => {
        return context.miner_repository.getMinerCredits(parent.id, args.page);
      },
      shares: (parent, args, context, info) => {
        const start_time = new Date(new Date().getTime() - (24 * 60 * 60 * 1000));
        // Always fetch 24 hours for now
        return context.miner_repository.getSharesByTime(parent.id, start_time);
      }
    },
    Query: {
      minerData: (parent, args, context, info) => {
        return context.miner_repository.getMiner(args.id)
            .then((miner) => {
              return miner.toJSON();
            });
      },
    }
  },
};

module.exports = MinerSchema;
