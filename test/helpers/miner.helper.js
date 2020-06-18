'use strict';
const testing = require('../test.init.js');
const uuid = require('uuid/v4');

const MinerModel = require('src/models/miner.model.js');
const ShareModel = require('src/models/share.model.js');
const SystemHashrateModel = require('src/models/system.hashrate.model.js');

const HashrateModel = require('src/models/hashrate.model.js');

// Hardcode to ensure that test schema is flushed properly
const minerId_1 = 'df4df861-a914-4853-8f26-0c800d180787';

const sampleMiners = [
    {
        id: minerId_1,
        credits: 0,
    },
    {
        id: uuid(),
        credits: 0,
    },
    {
        id: uuid(),
        credits: 0,
    },
];


const clearAllMiners = () => {
    return MinerModel.destroy({
        truncate: true,
        cascade: true,
        force: true
    })
        .then(() => {
            return HashrateModel.destroy({
                truncate: true,
                cascade: true,
                force: true
            })
        })
        .then(() => {
            return ShareModel.destroy({
                truncate: true,
                cascade: true,
                force: true
            })
        })
        .then(() => {
            return SystemHashrateModel.destroy({
                truncate: true,
                cascade: true,
                force: true
            })
        })

}

const createSampleMiners = () => {
    return Promise.all(sampleMiners.map(miner => {
        return MinerModel.create(miner);
    }));
}


const MinerHelpers = {
    minerId_1,
    sampleMiners,
    clearAllMiners,
    createSampleMiners,
}

module.exports = MinerHelpers;