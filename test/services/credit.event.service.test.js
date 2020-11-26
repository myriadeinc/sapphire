"use strict";

const _ = require("lodash");

const testing = require("../test.init.js");
const MinerTestingHelper = require("test/helpers/miner.helper.js");
const CreditEventService = require("src/service/credit.event.service.js");
const MinerRepository = require("src/repository/miner.repository.js");
const EventCmsModel = require("../../src/models/event.cms.model.js");
const { getCreditEvents } = require("../../src/service/credit.event.service.js");
let eventInfo;

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

    it("Should mark an event as closed", async () => { 
        const minerId = MinerTestingHelper.minerId_1;
        const amount = 1000;
        const lockType = 1;

        // Grant the miner credits, register and close the event
        await MinerRepository.grantMinerCredits(minerId, 10000);
        await CreditEventService.create(minerId, amount, lockType, eventInfo.id);
        await CreditEventService.closeEvent(eventInfo.id, minerId);
        
        // Fetch the event and verify that it's status is 10 (closed)
        const event = (await CreditEventService.getCreditEvents(minerId))[0];
        event.status.should.equal(10);
    })

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

    it("Should get all credit events for the specified miner", async () => {
        const minerId = MinerTestingHelper.minerId_1;
        const amount = 1000;
        const lockType = 1;
        
        // Create a new event
        await CreditEventService.create(minerId, amount, lockType, eventInfo.id);
        // Fetch all the miner's credit events and ensure that the result is not null
        const creditEvents = await CreditEventService.getCreditEvents(minerId);
        creditEvents.should.not.equal(null);
    })

    it("Should create a credit event", async () => {
        // Create the new event
        const newEvent = await CreditEventService.createEvent({prizeAmount: 100});
        //Fetch all events and check if the newly created event exists
        const ac = await CreditEventService.getActiveContent();
        const exists = ac.map(event => event.id).includes(newEvent.id);
        exists.should.equal(true);
    })

    it("Should get active content", async () => {
        // Fetch all events and check that the test event exists
        const ac = await CreditEventService.getActiveContent();
        const exists = ac.map(event => event.id).includes(eventInfo.id);
        exists.should.equal(true);
    })

});
