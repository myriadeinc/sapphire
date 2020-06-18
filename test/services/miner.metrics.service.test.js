"use strict";

const testing = require("../test.init.js");
const MinerTestingHelper = require("test/helpers/miner.helper.js");
const ShareTestingHelper = require("test/helpers/shares.helper.js");

const HashrateModel = require('src/models/hashrate.model.js');
const SystemHashrateModel = require('src/models/system.hashrate.model.js');

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
const refHeight = getRandomInt(123456, 12345678);
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
        try {
            await MinerMetricsService.convertSharesToHashrate(refHeight);
        } catch (err) {
            console.dir(err)
        }

        let poolRate = 0n;
        for (const miner of minerData) {
            const minerStats = await Promise.all([
                HashrateModel.findOne({
                    where: {
                        minerId: miner.id,
                        blockHeight: refHeight
                    },
                    raw: true
                }),
                MinerRepository.getBlockShares(
                    miner.id,
                    refHeight,
                )
            ])

            //     /**
            //    * https://github.com/mochajs/mocha/pull/4112
            //    * BigInt isn't properly supported at the time of this version of mocha/chai
            //    */

            // Miner hashrate check
            // console.dir(minerStats[0])
            let rate = minerStats[0].rate.toString();
            rate.should.be.eql(miner.sum.toString());
            // Miner shares should be empty
            minerStats[1].should.be.eql([]);
            poolRate += BigInt(minerStats[0].rate)


        }
        const systemHashrate = await SystemHashrateModel.findByPk(refHeight.toString(), { raw: true });

        poolRate = poolRate.toString();

        // Pool hashrate should be counted properly
        poolRate.should.be.equal(systemHashrate.poolRate.toString())

        await ShareTestingHelper.clearSampleShares();
    });

});
