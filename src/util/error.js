'use strict';
const Err = require('egads')
    .extend('Unexpected error occured', 500, 'InternalServerError');

Err.Miner = Err.extend('Miner Error', 500, 'AccountError');

module.exports = Err;
