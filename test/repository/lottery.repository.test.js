'use strict';

const _ = require('lodash');

const testing = require('../test.init.js');
const MinerTestingHelper = require('test/helpers/miner.helper.js');
const LotterTestingHelper = require('test/helpers/lottery.helper.js');

const LotteryRepository = require('src/repository/lottery.repository.js');

const { LotteryDrawModel, MinerLotteryDraws } = require('src/models/lottery.draw.model.js');
const MinerModel = require('src/models/miner.model.js');


require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-string'))
  .should();

describe('Lottery repository unit tests', () => {
  before('Await DB', () => {
    return testing.dbReady;
  });

  beforeEach('Setup fixtures', async () => {
    await LotterTestingHelper.createActiveDraw();
    await LotterTestingHelper.createInactiveDraw()
  });

  afterEach('Teardown lottery draws', async () => {
    await LotterTestingHelper.deleteDraws();
  });

  it('Should be able to create a new draw and close old one', async () => {
    let original_draw = await LotteryDrawModel.findOne({where: {is_active: true}});
    const original_daw_id = original_draw.dataValues.id;
    let new_draw = await LotteryRepository.newDraw(Date.now(), 20);

    new_draw.is_active.should.be.true;
    new_draw.pot.should.equal('20');

    original_draw = await LotteryDrawModel.findOne({where: {id: original_daw_id}});
    original_draw.is_active.should.be.false;

  });

  it('Should only have one active draw upon creation', async () => {
    await LotteryRepository.newDraw(Date.now(), 20);

    const draws = await LotteryDrawModel.findAll();

    const active_draws = _.filter(draws, {is_active: true});
    active_draws.length.should.equal(1);
  })

  it('Should be able to associate a miner to a draw', async () => {
    await MinerTestingHelper.createSampleMiners();
    

    let draw = await LotteryDrawModel.findOne({where: {is_active: true}});
    
    draw.should.not.be.null;
    const draw_pot = draw.pot;

    let miner1_id = MinerTestingHelper.minerId_1;
    await MinerTestingHelper.addSampleCredits(miner1_id);
    
    const miner1 = await MinerModel.findOne({where: {id: miner1_id}});

    draw = await LotteryRepository.addMinerToDraw(miner1_id, 5);
    const updated_miner_credits = await MinerTestingHelper.getMinerCredits(miner1_id)
    updated_miner_credits.should.equal(5);
    draw.pot.should.equal((draw_pot + 5).toString());

    let miners = await draw.getMiners();
    miners.should.not.be.null;
   
    miners[0].dataValues.id.should.equal(miner1.id);

    let draws = await miner1.getDraws();
    draws.should.not.be.null;
    draws[0].dataValues.id.should.equal(draw.id);
    
    await MinerTestingHelper.clearAllMiners();
  });
})