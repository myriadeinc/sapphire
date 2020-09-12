"use strict";

const _ = require("lodash");

const testing = require("../test.init.js");
const MinerTestingHelper = require("test/helpers/miner.helper.js");
const CreditEventService = require("src/service/credit.event.service.js");
const MinerRepository = require("src/repository/miner.repository.js");


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

    it("Should be able to lock a miners funds", async () => {
        const minerId = MinerTestingHelper.minerId_1;
        await MinerRepository.grantMinerCredits(minerId, 10000);
        const amount = 1000;
        const lockType = 1;

        await CreditEventService.create(minerId, amount, lockType);
        const miner = await MinerRepository.getMinerDataById(minerId);
        const newBalance = miner.credits;

        newBalance.should.equal(9000);
    });

    //   it("Should be able to fully release funds", async () => {
    //     // miner2 add lock funds equal to monero balance
    //     // check that all open funds empty
    //     // log payout to audit record
    //     // miner2 balance should be all empty
    //   });

    //   it("Should be able to do some stuff", async () => { });
});
