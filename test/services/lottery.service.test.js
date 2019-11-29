'use strict';

const _ = require('lodash');

const testing = require('../test.init.js');
const MinerTestingHelper = require('test/helpers/miner.helper.js');
const LotterTestingHelper = require('test/helpers/lottery.helper.js');

const LotteryRepository = require('src/repository/lottery.repository.js');
const LotteryService = require('src/service/lottery.service.js');

const { LotteryDrawModel, MinerLotteryDraws } = require('src/models/lottery.draw.model.js');
const MinerModel = require('src/models/miner.model.js');


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-string'))
  .should();

describe('Lottery Service Unit tests', () => {
  before('Await DB', () => {
    return testing.dbReady;
  });

  beforeEach('Setup fixtures', async () => {
    await MinerTestingHelper.createSampleMiners();
    await LotterTestingHelper.createActiveDraw();
    await LotterTestingHelper.createInactiveDraw()
  });

  afterEach('Teardown lottery draws', async () => {
    await LotterTestingHelper.deleteDraws();
    await MinerTestingHelper.clearAllMiners();
  });

  it('#tick should perform a draw and create a new draw', async () => {

    // Setting up the use with the draws
    let miner1_id = MinerTestingHelper.minerId_1;
    await MinerTestingHelper.addSampleCredits(miner1_id);

    let draw = await LotteryRepository.addMinerToDraw(miner1_id, 1000000);
    const pot = Number(draw.pot);

    const next_time = Date.now() + 1000;

    const new_draw = await LotteryService.tick(next_time);

    const winner_id = LotteryService.getLastWinner();
    winner_id.should.not.be.null;
    winner_id.should.be.equal(miner1_id);
    new_draw.is_active.should.be.true;

    const miner1 = await MinerModel.findOne({where: {id: miner1_id}});
    miner1.monero_balance.should.equal(pot.toString());

  })
})