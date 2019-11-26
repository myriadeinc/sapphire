'use strict';

const MinerModel = require('src/models/miner.model.js');
const HashRateModel = require('src/models/hashrate.model.js');
const MyriadeCreditModel = require('src/models/credit.model.js');
const ShareModel = require('src/models/share.model.js');

const Op = require('src/util/db.js').Sequelize.Op;
const logger = require('src/util/logger.js').db;

const MinerRepository = {

  getMinerDataById: (id) => {
    return MinerModel.findByPk(id)
        .catch((err) => {
          logger.error(err);
        });
  },

  getMinerHashrates: (id, page) => {
    if (!page || page <= 0) {
      page = 1;
    }
    return HashRateModel.findAll({
      where: {
        minerId: id,
      },
      order: [
        ['time', 'DESC'],
      ],
      offset: ((page-1)*50),
      limit: 50,
      subQuery: false,
    });
  },

  getMinerCredits: (id, page) => {
    if (!page || page <= 0) {
      page = 1;
    }
    return MyriadeCreditModel.findAll({
      where: {
        minerId: id,
      },
      order: [
        ['time', 'DESC'],
      ],
      offset: ((page-1)*50),
      limit: 50,
      subQuery: false,
    });
  },

  updateHashrate: ({minerId, hashrate, time}) => {
    return HashRateModel.create({
      minerId,
      rate: hashrate,
      time,
    });
  },


  insertShare: ({minerId, share, difficulty, time}) => {
    return ShareModel.create(
        {
          minerId,
          share,
          difficulty,
          time,
        });
  },

  getSharesByTime: (minerId, startTime, endTime = null) => {
    endTime = endTime || Date.now();
    return ShareModel.findAll({
      attributes: ['id', 'minerId', 'difficulty', 'share', 'time', 'is_calculated'],
      where: {
        minerId,
        time: {
          [Op.between]: [startTime, endTime],
        },
      },
      order: [['time', 'DESC']],
    });
  },

  getUncalculatedShares: (minerId) => {
    return ShareModel.findAll({
      attributes: ['id', 'minerId', 'difficulty', 'share', 'time', 'is_calculated'],
      where: {
        minerId,
        is_calculated: false,
      },
      order: [['time', 'DESC']],
    });
  },


  updateCredit: ({minerId, credit, time}) => {
    return MyriadeCreditModel.create({
      minerId,
      credit,
      time,
    });
  },

  getMiner: (minerId) => {
    return MinerModel.findOrCreate({
      where: {
        id: minerId,
      },
      defaults: {
        monero_balance: 0,
        myriade_credits: 0,
      },
    })
        .then(([miner, created]) => {
          return miner;
        });
  },

  updateMiner: ({minerId, data}) => {
    return MinerModel.update({
      data,
      where: {
        id: minerId,
      },
    });
  },
};

module.exports = MinerRepository;
