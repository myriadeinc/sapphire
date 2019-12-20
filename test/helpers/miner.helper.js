'use strict';
const testing = require('../test.init.js');
const fakerStatic = require('faker');

const uuid = require('uuid');

const MinerModel = require('src/models/miner.model.js');

const HashrateModel = require('src/models/hashrate.model.js');
const CreditModel = require('src/models/credit.model.js');
const ShareModel = require('src/models/share.model.js');

const minerId_1 = uuid();

const allMiners = [
    {
        id: minerId_1,
        monero_balance: fakerStatic.random.number()
    },
    {
        id: fakerStatic.random.uuid(),
        monero_balance: fakerStatic.random.number()
    },
    {
        id: fakerStatic.random.uuid(),
        monero_balance: fakerStatic.random.number()
    }
    
];


const allShares = [
    {
        share: 1,
        difficulty: fakerStatic.random.number(),
        blockHeight: 1000,
        time: Date.now()
    },
    {
        share: 1,
        difficulty: fakerStatic.random.number(),
        blockHeight: 1000,
        time: Date.now() -10
    },
    {
        share: 1,
        difficulty: fakerStatic.random.number(),
        blockHeight: 1000,
        time: Date.now() - 20
    },
    {
        share: 1,
        difficulty: fakerStatic.random.number(),
        blockHeight: 1000,
        time: Date.now() - 120
    },
    
];

const allHashrates = [
    {
        time: Date.now(),
        rate: 3239283
    },
    {
        time: Date.now()-1000,
        rate: 2239283
    },
    {
        time: Date.now()-2000,
        rate: 1239283
    },
];


const allCredits = [
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
    })
    .then(() => {
        return ShareModel.destroy({
            truncate: true,
            cascade: true,
            force: true
        })
    });
}

const createSampleMiners = () => {
    return Promise.all(allMiners.map(miner => {
        return MinerModel.create(miner);
    }));
}


const addSampleShares = (minerId) =>{
    return Promise.all(allShares.map(sh => {
        return ShareModel.create({
            minerId,
            ...sh
        });
    }));
}

const addSampleHashrates = (minerId) =>{
    return Promise.all(allHashrates.map(hr => {
        return HashrateModel.create({
            minerId,
            ...hr
        });
    }));
}

const addSampleCredits = (minerId) =>{
    return Promise.all(allCredits.map(c => {
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
    allMiners, 
    allShares, 
    allHashrates,
    allCredits, 
    clearAllMiners,
    addSampleShares,
    addSampleHashrates,
    addSampleCredits,
    createSampleMiners,
    getMinerCredits,
}

module.exports = MinerHelpers;