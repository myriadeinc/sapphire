"use strict";
const sinon = require("sinon");
const testing = require("../test.init.js");
const MinerTestingHelper = require("test/helpers/miner.helper.js");
const ShareTestingHelper = require("test/helpers/shares.helper.js");

const HashrateModel = require('src/models/hashrate.model.js');
const SystemHashrateModel = require('src/models/system.hashrate.model.js');

const mq = require('src/util/mq.js');
const MoneroApi = require("src/api/monero.api.js");

const MinerRepository = require("src/repository/miner.repository.js");
const MinerMetricsService = require("src/service/miner.metrics.service.js");
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Store some state here because async behavior
 */
const refHeight = getRandomInt(123456, 2160959);
const miners = MinerTestingHelper.sampleMiners;
let minerData = [];

require("chai")
    .use(require("chai-as-promised"))
    .use(require("chai-string"))
    .should();

describe("Miner Metrics Service Functional Tests", () => {
    before("Await DB", () => {
        return testing.dbReady;
    });

    before("Setting up miners and shares", async () => {
        await Promise.all([
            MinerTestingHelper.clearAllMiners(),
            MinerTestingHelper.createSampleMiners(),
        ])
        minerData = await ShareTestingHelper.assignSharesToMiners(miners, refHeight);
    });

    after("Cleanup", async () => {
        await MinerTestingHelper.clearAllMiners();
    });

    it("Should be able to calculate proper pool and miner hashrate", async () => {

        const forceCalc = true;
        await MinerMetricsService.convertSharesToHashrate(refHeight, forceCalc);
        let poolRate = 0n;
        for (const miner of minerData) {
            const hashrate = await HashrateModel.findOne({
                where: {
                    minerId: miner.id,
                    blockHeight: refHeight
                },
                raw: true
            });
            //     /**
            //    * https://github.com/mochajs/mocha/pull/4112
            //    * BigInt isn't properly supported at the time of this version of mocha/chai
            //    */

            // Miner hashrate check
            let rate = hashrate.rate.toString();
            rate.should.be.eql(miner.sum.toString());
            // Miner shares should have been empty, now we will store them as immutable
            // shares.should.be.eql([]);
            poolRate += BigInt(rate)

        }
        const systemHashrate = await SystemHashrateModel.findByPk(refHeight.toString(), { raw: true });

        poolRate = poolRate.toString();

        // Pool hashrate should be counted properly
        poolRate.should.be.equal(systemHashrate.poolRate.toString())

        await ShareTestingHelper.clearSampleShares();
    });

    it("Should be able to grant miner credits given a single share", async () => {
        
        var mq_stub = sinon.stub(mq, "registerConsumer");
        var api_stub = sinon.stub(MoneroApi, "getBlockInfoByHeight");
        api_stub.returns({
            reward: 123456789,
            difficulty: 1234567890
        })
        
        const minerId = MinerTestingHelper.minerId_1;
    
        const data = {
            minerId: minerId,
            shares: 1,
            difficulty: 1234567890,
            blockHeight: 1000
        }
        MinerMetricsService.init(999);
        await MinerMetricsService.processData(data);
        const result = await MinerMetricsService.calculateForBlock(1000)
        const miner = await MinerRepository.getMiner(minerId)
        minerData = miner.toJSON()
        minerData.credits.should.be.equal('1111')

        result.should.not.be.null;
    });

    it("Should be able to save miner share", async () => {
        const minerId = MinerTestingHelper.minerId_1;
        const data = {
            minerId: minerId,
            shares: 1,
            difficulty: 1234,
            blockHeight: 0
        }
        const result = await MinerMetricsService.processData(data);
        result.should.not.be.null;
    });

});
