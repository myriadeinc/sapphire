"use strict";

const _ = require("lodash");

const testing = require("../test.init.js");
const MinerTestingHelper = require("test/helpers/miner.helper.js");
const CreditEventService = require("src/service/credit.event.service.js");
const MinerRepository = require("src/repository/miner.repository.js");
const EventCmsModel = require("../../src/models/event.cms.model.js");
let eventInfo;

require("chai")
    .use(require("chai-as-promised"))
    .use(require("chai-string"))
    .should();

describe.only("Credit Event Service Unit Tests", () => {
    before("Await DB", () => {
        return testing.dbReady;
    });

    before("Setting up miners", async () => {
        await MinerTestingHelper.clearAllMiners();
        await MinerTestingHelper.createSampleMiners();
        eventInfo = await CreditEventService.createEvent({ prizeAmount: 100 })

    })
    after("Cleanup", async () => {
        await MinerTestingHelper.clearAllMiners();
        await EventCmsModel.destroy({ where: { id: eventInfo.id } })
    })

    it("Should be able to lock a miners funds", async () => {
        const minerId = MinerTestingHelper.minerId_1;
        await MinerRepository.grantMinerCredits(minerId, 10000);
        const amount = 1000;
        const lockType = 1;

        await CreditEventService.create(minerId, amount, lockType, eventInfo.id);
        const miner = await MinerRepository.getMinerDataById(minerId);
        const newBalance = miner.credits.toString()

        newBalance.should.equal('9000');
    })

    //   it("Should be able to fully release funds", async () => {
    //     // miner2 add lock funds equal to monero balance
    //     // check that all open funds empty
    //     // log payout to audit record
    //     // miner2 balance should be all empty
    //   });

    it("Should mark an event as closed", async () => { })
    it("Should fetch all participants in a credit event", async () => {
        // This gives all miners some credits
        await Promise.all(MinerTestingHelper.sampleMiners.map(miner => CreditEventService.grantMinerCredits(miner.id, 100)))
        // This enrolls all miners to a credit event
        await Promise.all(MinerTestingHelper.sampleMiners.map(miner => CreditEventService.create(miner.id, 10, 1, eventInfo.id)))

        // One extra credit event
        await CreditEventService.create(MinerTestingHelper.minerId_1, 10, 1, eventInfo.id)
        // Fetch all miners, duplicate ones should be combined into one entry
        const participants = await CreditEventService.getUniqueParticipants(eventInfo.id)
        const expected = MinerTestingHelper.sampleMiners.map(miner => miner.id.toString()).sort()
        participants.sort().should.eql(expected)


    })

});
