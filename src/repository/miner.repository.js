'use strict';

const MinerModel = require('src/models/miner.model.js');
const logger = require('src/util/logger.js').db;

const MinerRepository = {
  
  getMinerDataById: (id) => {
    return MinerModel.findByPk(id)
    .then(data => {
      return data;
    })
    .catch(err => {
      logger.error(err)
    })
  }
}

module.exports = MinerRepository