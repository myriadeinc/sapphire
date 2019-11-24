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
        credit: 1000000
    },
    {
        time: Date.now() - 100,
        credit: 800000
    },
    {
        time: Date.now() - 200,
        credit: 100000
    },
    {
        time: Date.now() - 300,
        credit: 400000
    },
]

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
        return CreditModel.destroy({
            truncate: true,
            cascade: true,
            force: true
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

const getMinerCredits = async (minerId) => {
    const available_credits = await CreditModel.findAll({
        where: { minerId },
        order: [['time', 'DESC']],
        limit: 1
    });
    if (!available_credits || 0 == available_credits.length) {
        return 0
    }
    return Number(available_credits[0].credit);
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
    getMinerCredits,
}

module.exports = MinerHelpers;