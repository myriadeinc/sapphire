'use strict';
const {gql} = require('apollo-server');
const MinerRepository = require('src/repository/miner.repository.js');

const MinerSchema = {
  typeDefs: gql(`
    type Hashrate {
      time: String!,
      rate: Int!
    }
    type MinerData {
      id: ID!,
      monero_balance: Int,
      myriade_credits: Int,
      hashrates: [Hashrate]
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
        return parent.getHashrates();
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