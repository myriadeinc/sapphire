"use strict";

const MinerModel = require("src/models/miner.model.js");
const HashRateModel = require("src/models/hashrate.model.js");
const ShareModel = require("src/models/share.model.js");

const Op = require("src/util/db.js").Sequelize.Op;
const logger = require("src/util/logger.js").minerRepository;
const cache = require('src/util/cache.js');

const MinerRepository = {
  getAllMiners: (onlyIds = false) => {
    if (onlyIds) {
      return MinerModel.findAll({
        attributes: ["id"],
        raw: true
      })
    }
    return MinerModel.findAll();
  },

  getMinerDataById: (id) => {
    return MinerModel.findByPk(id).catch((err) => {
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
      order: [["time", "DESC"]],
      offset: (page - 1) * 50,
      limit: 50,
      subQuery: false,
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },

  getAllMinerHashrates: (blockHeight) => {
    return HashRateModel.findAll({
      raw: true,
      where: {
        blockHeight
      }
    })

  },

  insertShare: (minerId, share, difficulty, blockHeight, time) => {

    const minerKey = `${minerId}_${blockHeight}`;
    const totalDiff = BigInt(share) * BigInt(difficulty);
    const namespace = "Sapphire"

    return cache.incrBy(minerKey, totalDiff.toString(), namespace)
      .then(() => {
        return cache.ttl(minerKey, 3600, namespace)
      })
      .then(() => {
        return {
          minerId,
          share: Number(share),
          difficulty: difficulty.toString(),
          blockHeight: blockHeight.toString(),
          time: new Date()
        }
      })

    // return ShareModel.create({
    //   minerId: minerId,
    //   share: Number(share),
    //   difficulty: BigInt(difficulty),
    //   blockHeight: BigInt(blockHeight),
    //   // Add proper time in later build
    //   time: new Date(),
    //   status: 0
    // }).catch((err) => {
    //   logger.error("Error inserting share!")
    //   logger.error(err);

    // });
  },

  getSharesByTime: (minerId, startTime, endTime = null) => {
    endTime = endTime || Date.now();
    return ShareModel.findAll({
      attributes: [
        "id",
        "minerId",
        "difficulty",
        "share",
        "time",
        "blockHeight",
      ],
      where: {
        minerId,
        time: {
          [Op.between]: [startTime, endTime],
        },
      },
      order: [["time", "DESC"]],
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },

  getBlockShares: (minerId, blockHeight) => {
    const minerKey = `${minerId}_${blockHeight}`
    const namespace = "Sapphire"
    // Not the most elegant, but lets preserve compatibility for now
    return cache.get(minerKey, namespace).then((totalDiff) => {
      return [{
        share: 1,
        difficulty: totalDiff || 0
      }]
    })
  },

  getRecentHashrates: (minerId, nBlocks) => {
    return HashRateModel.findAll({
      attributes: ["blockHeight", "time", "rate"],
      raw: true,
      where: {
        minerId: minerId,
      },
      limit: nBlocks,
      order: [['blockHeight', 'DESC']]
    })
  },

  getRecentShares: (minerId, nBlocks) => {
    return HashRateModel.findAll({
      attributes: [],
      raw: true,
      where: {
        minerId: minerId,
      },
      limit: nBlocks,
      order: ['blockHeight']
    })
  },

  getMiner: (minerId) => {
    return MinerModel.findOrCreate({
      where: {
        id: minerId,
      },
      defaults: {
        credits: 0,
        monero_balance: 0,
        pps_ratio: 0
      },
    })
      .then(([miner, created]) => {
        return miner;
      })
      .catch((err) => {
        logger.error(err);
        throw err;
      });
  },

  // Dangerous! We can modify the miner account balance this way, add a filter method beforehand
  updateMiner: (minerId, data) => {
    return MinerModel.update({
      ...data
    },
      {
        where: {
          id: minerId,
        },
      }).catch((err) => {
        logger.error(err);
        throw err;
      });
  },

  updateMinerFunds: (minerId, balance) => {
    return MinerModel.update({
      credits: balance
    },
      {
        where: {
          id: minerId,
        },
      }).catch((err) => {
        logger.error(err);
        throw err;
      });
  },

  minerCheckFunds: async (minerId, amount) => {
    const miner = await MinerModel.findByPk(minerId, { raw: true })
    return BigInt(miner.credits || 0) - BigInt(amount);
  },

  grantMinerCredits: (minerId, amount, transaction = null) => {
    return MinerModel.increment({
      credits: amount.toString()
    }, {
      where: {
        id: minerId,
      },
      transaction
    }).catch((err) => {
      logger.error(err);
      throw err;
    });
  },
};

module.exports = MinerRepository;
