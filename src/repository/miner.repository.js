'use strict';

const MinerModel = require('src/models/miner.model.js');
const HashRateModel = require('src/models/hashrate.model.js');
const MyriadeCreditModel = require('src/models/credit.model.js');
const ShareModel = require('src/models/share.model.js');

const Op = require('src/util/db.js').Sequelize.Op;
const logger = require('src/util/logger.js').minerRepository;

const MinerRepository = {

  getAllMiners: () => {
    return MinerModel.findAll();
  },

  getMinerDataById: (id) => {
    return MinerModel.findByPk(id)
      .catch((err) => {
        logger.error(err);
        throw err;
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
    }).catch((err) => {
      logger.error(err);
      throw err;
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
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },

  updateHashrate: ({minerId, hashrate, time}) => {
    return HashRateModel.create({
      minerId,
      rate: hashrate,
      time,
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },

  insertShare: ({minerId, share, difficulty, blockHeight, time}) => {
    return ShareModel.create(
      {
        minerId,
        share,
        difficulty,
        blockHeight,
        time,
      }).catch((err) => {
        logger.error(err);
        throw err;
      });
  },

  getSharesByTime: (minerId, startTime, endTime = null) => {
    endTime = endTime || Date.now();
    return ShareModel.findAll({
      attributes: ['id', 'minerId', 'difficulty', 'share', 'time', 'blockHeight'],
      where: {
        minerId,
        time: {
          [Op.between]: [startTime, endTime],
        },
      },
      order: [['time', 'DESC']],
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },

  getBlockShares: (minerId, blockHeight) => {
    return ShareModel.findAll({
      attributes: ['id', 'minerId', 'difficulty', 'share', 'time', 'blockHeight'],
      where: {
        minerId,
        blockHeight: blockheight,
      },
      order: [['time', 'DESC']],
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },


  updateCredit: ({minerId, credit, time}) => {
    return MyriadeCreditModel.create({
      minerId,
      credit,
      time,
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },

  getMiner: (minerId) => {
    return MinerModel.findOrCreate({
      where: {
        id: minerId,
      },
      defaults: {
        monero_balance: 0
      },
    })
    .then(([miner, created]) => {
      return miner;
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },

  updateMiner: ({minerId, data}) => {
    return MinerModel.update({
      data,
      where: {
        id: minerId,
      },
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },


  getMinerShares: () => {
    /**
     * Add the query
     */
    return ShareModel.find();
  },

};

module.exports = MinerRepository;
