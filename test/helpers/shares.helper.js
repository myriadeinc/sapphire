'use strict';
const testing = require('../test.init.js');
const uuid = require('uuid/v4');
const ShareModel = require('src/models/share.model.js');
const MinerTestingHelper = require("test/helpers/miner.helper.js");
const MinerRepository = require("src/repository/miner.repository.js");

const time1 = Date.now()
const time2 = Date.now() + 100
const time3 = Date.now() + 1000
const time4 = Date.now() + 5000

function getRandomBigInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return BigInt(Math.floor(Math.random() * (max - min + 1)) + min);
}

function getRandomDate(end) {
  let start = new Date();
  // Between 1 and 5 m ago
  const minutes = Number(getRandomBigInt(1, 5));
  start.setMinutes(end.getMinutes() - minutes);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


const SharesHelper = {
  generateRandomShare: (blockHeight) => {
    return {
      time: getRandomDate(new Date()),
      blockHeight,
      difficulty: getRandomBigInt(123456, 1234567890),
      share: getRandomBigInt(1, 10)
    }
  },
  getRandomShares: (blockHeight) => {
    let shares = [];
    // Eventual target time 10 shares per block
    const numShares = getRandomBigInt(0, 25);
    for (let i = 0; i < numShares; i++) {
      shares.push(SharesHelper.generateRandomShare(blockHeight));
    }
    return shares;
  },
  assignSharesToMiners: async (miners, refHeight) => {
    let minerData = [];
    // We use for here to force the await to resolve
    for (const miner of miners) {
      await MinerRepository.getMiner(miner.id)
      const shares = SharesHelper.getRandomShares(refHeight);
      let sum = 0n;
      await Promise.all(
        shares.map(async (share) => {
          sum += BigInt(share.share * share.difficulty);
          return MinerRepository.insertShare(miner.id, share.share, share.difficulty, refHeight, new Date());
        })
      )
      sum = BigInt(sum / 120n);
      minerData.push({
        id: miner.id,
        sum
      });
    }
    return minerData;
  },


  clearSampleShares: () => {
    return ShareModel.destroy({
      truncate: true,
      cascade: true,
      force: true
    });
  }
}

module.exports = {
  ...SharesHelper,
  getRandomBigInt
};