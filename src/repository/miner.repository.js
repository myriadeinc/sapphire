'use strict';

const MinerModel = require('src/models/miner.model.js');

const MinerRepository = {
  getMinerDataById: (id) => {
    return MinerModel.findById(id);
  }
}

module.exports = MinerRepository