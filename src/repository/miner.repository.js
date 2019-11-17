'use strict';

const MinerModel = require('src/models/miner.model.js');

const MinerRepository = {
  getMinerDataById: (id) => {
    console.log(id)
    return MinerModel.findByPk(id)
    .then(data => {
      return data;
    })
  }
}

module.exports = MinerRepository