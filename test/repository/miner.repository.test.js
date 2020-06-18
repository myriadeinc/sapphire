'use strict';

const _ = require('lodash');

const testing = require('../test.init.js');
const MinerTestingHelper = require('test/helpers/miner.helper.js');
const ShareTestingHelper = require('test/helpers/shares.helper.js');

const MinerRepository = require('src/repository/miner.repository.js');

require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-string'))
    .should();

describe('Miner Repository Unit Tests', () => {
    before('Await DB', () => {
        return testing.dbReady;
    });

    before('Setting up miners', async () => {
        await MinerTestingHelper.clearAllMiners();
        await MinerTestingHelper.createSampleMiners();
    })

    after('Cleanup', async () => {
        await MinerTestingHelper.clearAllMiners();
    })

    it('Should be able to fetch a miner', async () => {
        const miner = await MinerRepository.getMinerDataById(MinerTestingHelper.minerId_1);
        miner.should.not.be.null;
        miner.credits.should.equal('0');
    })

    it('Should insert miner shares', async () => {
        const refHeight = 100n;
        const shareData = ShareTestingHelper.generateRandomShare(refHeight);

        let created_share = await MinerRepository.insertShare(shareData);

        created_share.should.not.be.null;
        created_share.blockHeight.should.equal(refHeight.toString());
        created_share.minerId.should.equal(shareData.minerId);
        (created_share.share).toString().should.equal(shareData.share);
        (created_share.difficulty).toString().should.equal(shareData.difficulty);
    })

    // it('Should be able to fetch miner hashrates', async () => {

    //     const refHeight = Math.random();
    //     await HashrateTestingHelper.createSampleHashrates(miners, refHeight)

    //     MinerRepository.getAllMinerHashrates(refHeight).then((hashrates) => {
    //         hashrates.forEach(hashrate => {
    //             hashrate.should.not.be.null;
    //             console.dir(hashrate)
    //         })
    //     });
    // })


    // it('Should be able to grant miner credits', async () => {
    //     const testId = MinerTestingHelper.sampleMiners[1].id;
    //     // psql max bigint ~18 digits
    //     await MinerRepository.grantMinerCredits(testId, '12345678901234567');
    //     const testUser = await MinerRepository.getMinerDataById(testId);
    //     testUser.toJSON().credits.toString().should.be.equal('12345678901234567')
    // })

})