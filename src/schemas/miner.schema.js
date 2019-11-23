'use strict';
const {gql} = require('apollo-server');
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

    type MinerData {
      id: ID!,
      monero_balance: Int,
      myriade_credits(page: Int): [MyriadeCredit],
      hashrates(page: Int): [Hashrate],
    }

    type Query {
      minerData(id: ID!): MinerData
    }
  `), 
  context: {
    repository: MinerRepository
  },
  resolvers: {
    MinerData: {
      hashrates: (parent, args, context, info) => {
        return context.repository.getMinerHashrates(parent.id, args.page);
      },
      myriade_credits: (parent, args, context, info) => {
        return context.repository.getMinerCredits(parent.id, args.page);
      }
    },
    Query: {
      minerData: (parent, args, context, info) => {
        return context.repository.getMinerDataById(args.id);
      }
    }
  }
}

module.exports = MinerSchema;