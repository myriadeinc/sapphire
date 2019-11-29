'use strict';

const _ = require('lodash');

const faker = require('faker');

const testing = require('../test.init.js');

const MinerTestingHelper = require('test/helpers/miner.helper.js');
const ShareTestingHelper = require('test/helpers/shares.helper.js');

const PayoutService = require('src/service/payout.service.js');
const MinerRepository = require('src/repository/miner.repository.js');


const HashrateModel = require('src/models/hashrate.model.js');
const CreditModel = require('src/models/credit.model.js');
const ShareModel = require('src/models/share.model.js');


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-string'))
  .should();

  describe('Miner Payout Service Tests', () => {
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
  
    // it('Should give each miner a constant payout', async () => {
    //   let blockHeight = 10;
    //     const trigger = await PayoutService.actionPayout(blockHeight);
    //   const miner = await MinerRepository.getMinerDataById(MinerTestingHelper.minerId_1);
    //   miner.should.not.be.null;
    //   miner.monero_balance.should.equal('0');
    // })
  
  })