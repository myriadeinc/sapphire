"use strict";
const testing = require("../test.init.js");
const MinerTestingHelper = require("test/helpers/miner.helper.js");

const CreditService = require("src/service/credit.service.js");

const SystemHashrateModel = require("src/models/system.hashrate.model.js")
const MinerModel = require("src/models/miner.model.js");
const HashrateModel = require('src/models/hashrate.model.js');

require("chai")
    .use(require("chai-as-promised"))
    .use(require("chai-string"))
    .should();

describe("Credit Event Service Unit Tests", () => {
    before("Await DB", () => {
        return testing.dbReady;
    });

    before("Setting up miners", async () => {
        await MinerTestingHelper.clearAllMiners();
        await MinerTestingHelper.createSampleMiners();
    });

    after("Cleanup", async () => {
        await MinerTestingHelper.clearAllMiners();
    });

    it("Should be able to calculate credits", () => {
        const systemInfo = {
            reward: 1627091224764,
            poolRate: 12345678901
        };
        const minerRate = 123456;
        const credit = CreditService.creditConverter(minerRate, systemInfo)

        credit.should.not.be.null;
    });

    it("Should be able to grant credits to miners", async () => {
        const refHeight = 2118585;
        let miners = MinerTestingHelper.sampleMiners;
        await Promise.all(
            miners.map(miner => {
                return HashrateModel.create({
                    minerId: miner.id,
                    rate: '123456789',
                    blockHeight: refHeight
                })
            })
        )
        await SystemHashrateModel.create({
            poolRate: '154737604954',
            blockHeight: refHeight,
            globalDiff: '154737604954',
            reward: '1613816433342'
        })
        await CreditService.hashrateToCredits(refHeight);
        miners = await MinerModel.findAll({ raw: true })
        miners.forEach(miner => {
            miner.credits.should.not.be.null;
            // Will only work if credits is below a certain amount
            Number(miner.credits).should.be.above(0);
        })
        await SystemHashrateModel.destroy({ where: { blockHeight: refHeight } })

    });

});
