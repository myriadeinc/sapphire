'use strict';

const _ = require('lodash');

const testing = require('../test.init.js');
const MinerTestingHelper = require('test/helpers/miner.helper.js');
const ShareTestingHelper = require('test/helpers/shares.helper.js');
const MinerRepository = require('src/repository/miner.repository.js');


const HashrateModel = require('src/models/hashrate.model.js');
const CreditModel = require('src/models/credit.model.js');
const ShareModel = require('src/models/share.model.js');

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-string'))
  .should();

describe('Miner Repository Unit Tests', () => {
  before('Await DB', () => {
    return testing.dbReady;
  });

  before('Setting up miners', async () => {
    await MinerTestingHelper.clearAllMiners();
    await MinerTestingHelper.createSampleMiners();

    await MinerTestingHelper.addSampleHashrates(MinerTestingHelper.minerId_1);
    await MinerTestingHelper.addSampleCredits(MinerTestingHelper.minerId_1);
  })

  after('Cleanup', async () => {
    await MinerTestingHelper.clearAllMiners();
  })

  it('Should be able to fetch a miner', async () => {
    const miner = await MinerRepository.getMinerDataById(MinerTestingHelper.minerId_1);
    miner.should.not.be.null;
    miner.monero_balance.should.equal(MinerTestingHelper.allMiners[0].monero_balance.toString());
  })

  it('Should be able to fetch hashrate for a miner', async () => {
    let hashrates = await MinerRepository.getMinerHashrates(MinerTestingHelper.minerId_1, null);
    
    hashrates = hashrates.map(hr => {
      return Number(hr.dataValues.rate);
    }).sort();
    hashrates.should.not.be.null;
    hashrates.length.should.equal(MinerTestingHelper.allHashrates.length);

    const expected_hr = MinerTestingHelper.allHashrates.map(hr => {
      return hr.rate;
    }).sort();
    
    expected_hr.should.be.eql(hashrates);
  })

  it('Should be able to fetch credits for a miner', async () => {
    let credits = await MinerRepository.getMinerCredits(MinerTestingHelper.minerId_1, null);
    
    credits = credits.map(c => {
      return Number(c.dataValues.credit);
    }).sort();
    credits.should.not.be.null;
    credits.length.should.equal(MinerTestingHelper.allCredits.length);

    const expected_credits = MinerTestingHelper.allCredits.map(c => {
      return c.credit;
    }).sort();

    expected_credits.should.be.eql(credits);
  })

  // TODO: Add proper tests for shares
  // it('Should be able to range query miner shares by time', async () => {

  //   const miner1_id = MinerTestingHelper.minerId_1;
  //   const start_time = ShareTestingHelper.time1;
  //   const end_time = ShareTestingHelper.time3;
  //   let sampleShares = ShareTestingHelper.sampleShares;

  //   sampleShares = sampleShares.map(s => {
  //     return {
  //       minerId: miner1_id,
  //       ...s
  //     }
  //   });
  //   await ShareTestingHelper.createSampleShares(sampleShares);

  //   let shares = await MinerRepository.getSharesByTime(miner1_id, start_time, end_time);

  //   shares.should.not.be.null;
  //   shares.length.should.equal(3);

  //   let sum = _.reduce(shares, (accum, s) => {
  //     return accum + Number(s.share) }, 0);
  //   sum.should.equal(6);
  //   await ShareTestingHelper.clearSampleShares();
  // });

  it('Should insert miner shares', async () => {
    const shareData = {
      minerId: MinerTestingHelper.minerId_1,
      share: 1,
      difficulty: 1000000,
      blockHeight: 10,
      time: Date.now() - 200,
    }

    let created_share = await MinerRepository.insertShare(shareData);

    created_share.should.not.be.null;
    created_share.blockHeight.should.equal(shareData.blockHeight.toString());
    created_share.minerId.should.equal(shareData.minerId);
    Number(created_share.share).should.equal(shareData.share);
    Number(created_share.difficulty).should.equal(shareData.difficulty);
  })
  
  it('Should be able to update miner Hashrate', async () => {
    const miner2 = await MinerRepository.getMinerDataById(MinerTestingHelper.allMiners[1].id);

    let testHashrate = 300;
    await MinerRepository.updateHashrate({
      minerId: miner2.id,
      hashrate: testHashrate,
      time: Date.now()
    })

    const hr = await HashrateModel.findOne({
      where: {
        minerId: miner2.id
      }
    });
    hr.should.not.be.null;
    Number(hr.rate).should.equal(testHashrate);
  })
  

  it('Should be able to update miner Credit', async () => {
    const miner3 = await MinerRepository.getMinerDataById(MinerTestingHelper.allMiners[2].id);

    let testCredit = 10;
    await MinerRepository.updateCredit({
      minerId: miner3.id,
      credit: testCredit,
      time: Date.now()
    })

    const c = await CreditModel.findOne({
      where: {
        minerId: miner3.id
      }
    });
    c.should.not.be.null;
    Number(c.credit).should.equal(testCredit);
  })

})