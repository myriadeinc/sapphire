'use strict';

const _ = require('lodash');

const testing = require('../test.init.js');
const MinerTestingHelper = require('test/helpers/miner.helper.js');
const MinerRepository = require('src/repository/miner.repository.js');

const HashrateModel = require('src/models/hashrate.model.js');
const CreditModel = require('src/models/credit.model.js');

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
    miner.monero_balance.should.equal('0');
  })

  it('Should be able to fetch hashrate for a miner', async () => {
    let hashrates = await MinerRepository.getMinerHashrates(MinerTestingHelper.minerId_1, null);
    
    hashrates = hashrates.map(hr => {
      return Number(hr.dataValues.rate);
    }).sort();
    hashrates.should.not.be.null;
    hashrates.length.should.equal(4);

    const expected_hr = MinerTestingHelper.sampleHashrates.map(hr => {
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
    credits.length.should.equal(4);

    const expected_credits = MinerTestingHelper.sampleCredits.map(c => {
      return c.credit;
    }).sort();

    expected_credits.should.be.eql(credits);
  })

  it('Should be able to update miner Hashrate', async () => {
    const miner2 = await MinerRepository.getMinerDataById(MinerTestingHelper.sampleMiners[1].id);

    await MinerRepository.updateHashrate({
      minerId: miner2.id,
      hashrate: 300,
      time: Date.now()
    })

    const hr = await HashrateModel.findOne({
      where: {
        minerId: miner2.id
      }
    });
    hr.should.not.be.null;
    Number(hr.rate).should.equal(300);
  })

  it('Should be able to update miner Credit', async () => {
    const miner3 = await MinerRepository.getMinerDataById(MinerTestingHelper.sampleMiners[2].id);

    await MinerRepository.updateCredit({
      minerId: miner3.id,
      credit: 10,
      time: Date.now()
    })

    const c = await CreditModel.findOne({
      where: {
        minerId: miner3.id
      }
    });
    c.should.not.be.null;
    Number(c.credit).should.equal(10);
  })

})