'use strict';

const MinerModel = require('src/models/miner.model.js');
const HashRateModel = require('src/models/hashrate.model.js');
const MyriadeCreditModel = require('src/models/credit.model.js');

const logger = require('src/util/logger.js').db;

const MinerRepository = {
  
  getMinerDataById: (id) => {
    return MinerModel.findByPk(id)
    .catch(err => {
      logger.error(err)
    })
  },

  getMinerHashrates: (id, page) => {
    if(!page || page <= 0){
      page = 1
    }
    return HashRateModel.findAll({
      where: {
        minerId: id
      },
      order:[
          ["time","DESC"]
      ],
      offset:((page-1)*50),
      limit : 50,
      subQuery:false
    })
  },

  getMinerCredits: (id, page) => {
    if(!page || page <= 0){
      page = 1
    }
    return MyriadeCreditModel.findAll({
      where: {
        minerId: id
      },
      order:[
          ["time","DESC"]
      ],
      offset:((page-1)*50),
      limit : 50,
      subQuery:false
    })
  },

  updateHashrate: ({minerId, hashrate, time}) => {
    return HashRateModel.create({
      minerId,
      rate: hashrate,
      time
    })
  },

  getMiner: (minerId) => {
    return MinerModel.findOrCreate({
      where: {
        id: minerId
      },
      defaults: {
        monero_balance: 0,
        myriade_credits: 0
      }
    })
    .then(([miner, created]) => {
      return miner;
    })
  },

  updateMiner: ({minerId, data}) => {
    return MinerModel.update({
      data,
      where: {
        id: minerId
      }
    });
  } 
}

module.exports = MinerRepository