'use strict';
const testing = require('../test.init.js');
const uuid = require('uuid/v4');

const MinerModel = require('src/models/miner.model.js');

const HashrateModel = require('src/models/hashrate.model.js');
const CreditModel = require('src/models/credit.model.js');

const minerId_1 = uuid();

const sampleMiners = [
    {

        id: minerId_1,
        monero_balance: 0,
    },
    {

        id: uuid(),
        monero_balance: 0,
    },
    {

        id: uuid(),
        monero_balance: 0,
    },
];

const sampleHashrates =[
    {
        time: Date.now(),
        rate: 50
    },
    {
        time: Date.now() - 100,
        rate: 70
    },
    {
        time: Date.now() - 200,
        rate: 80
    },
    {
        time: Date.now() - 300,
        rate: 90
    },
]

const sampleCredits = [
    {
        time: Date.now(),
        credit: 10
    },
    {
        time: Date.now() - 100,
        credit: 8
    },
    {
        time: Date.now() - 200,
        credit: 1
    },
    {
        time: Date.now() - 300,
        credit: 4
    },
]

const clearAllMiners = () => {
    return MinerModel.destroy({
        truncate: true,
        cascade: true
    })
    .then(() => {
        return HashrateModel.destroy({
            truncate: true,
            cascade: true
        })
    })
    .then(() => {
        return CreditModel.destroy({
            truncate: true,
            cascade: true
        })
    });
}

const createSampleMiners = () => {
    return Promise.all(sampleMiners.map(miner => {
        return MinerModel.create(miner);
    }));
}

const addSampleHashrates = (minerId) =>{
    return Promise.all(sampleHashrates.map(hr => {
        return HashrateModel.create({
            minerId,
            ...hr
        });
    }));
}

const addSampleCredits = (minerId) =>{
    return Promise.all(sampleCredits.map(c => {
        return CreditModel.create({
            minerId,
            ...c
        });
    }));
}



const MinerHelpers = {
    minerId_1,
    sampleMiners,
    sampleCredits,
    sampleHashrates,
    clearAllMiners,
    addSampleHashrates,
    addSampleCredits,
    createSampleMiners,
}

module.exports = MinerHelpers;