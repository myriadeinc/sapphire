'use strict';
const _ = require('lodash');

const faker = require('faker');
const sinon = require('sinon');

const testing = require('../test.init.js');

const MinerTestingHelper = require('test/helpers/miner.helper.js');
const ShareTestingHelper = require('test/helpers/shares.helper.js');

const PayoutService = require('src/service/payout.service.js');
const MinerRepository = require('src/repository/miner.repository.js');

const moneroApi = require('src/api/monero.api.js');
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
      await MinerTestingHelper.addSampleShares(MinerTestingHelper.minerId_1);
    })
  
    after('Cleanup', async () => {
      await MinerTestingHelper.clearAllMiners();
    })
  
    // TODO: Add proper integration testing with sinon
    it('Should give miner a constant payout', async () => {
      let blockHeight = 1000;
      let minerId_1 = MinerTestingHelper.minerId_1;
      // let fullBlockReward = await moneroApi.getFullBlockReward(blockHeight);
      // let networkHashRate = await moneroApi.getNetworkHashrate(blockHeight);
      
      let status = await PayoutService.actionPayout(blockHeight);

      status.should.equal(1);
      // let calculatedCredits = BigInt(hashrate) * BigInt(fullBlockReward) * 0.9 ;
      // let credits = CreditModel.getTheLatestCreditBalance(minerId_1);
      // calculatedCredits.should.equal(credits.toString());


      
      
      
      // let blockHeight = 1000;
      // const trigger = await PayoutService.actionPayout(blockHeight);
      
      // miner.should.not.be.null;
      // miner.monero_balance.should.equal('0');
    })
  
  })