"use strict";

const _ = require("lodash");

const testing = require("../test.init.js");
const MinerTestingHelper = require("test/helpers/miner.helper.js");
const ShareTestingHelper = require("test/helpers/shares.helper.js");
const MinerRepository = require("src/repository/miner.repository.js");

const HashrateModel = require("src/models/hashrate.model.js");
const ShareModel = require("src/models/share.model.js");


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

    //   it("Should be able to lock a miners funds", async () => {
    //     const miner = null;
    //     const data = {};
    //     await CreditEventService.create(miner, data);
    //     const funds = await CreditEventModel.findById(miner);

    //     funds.should.equal(data);
    //   });

    //   it("Should be able to fully release funds", async () => {
    //     // miner2 add lock funds equal to monero balance
    //     // check that all open funds empty
    //     // log payout to audit record
    //     // miner2 balance should be all empty
    //   });

    //   it("Should be able to do some stuff", async () => { });
});
