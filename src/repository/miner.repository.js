'use strict';

const MinerModel = require('src/models/miner.model.js');
const HashrateModel = require('src/models/hashrate.model.js');

const logger = require('src/util/logger.js').db;

const MinerRepository = {
  
  getMinerDataById: (id) => {
    return MinerModel.findByPk(id)
    .catch(err => {
      logger.error(err)
    })
  },

  getMinerHashrates: (id, page=1) => {
    return HashrateModel.findAll({
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
  }
}

module.exports = MinerRepository