'use strict';
const Err = require('egads')
    .extend('Unexpected error occured', 500, 'InternalServerError');

Err.Miner = Err.extend('Miner Error', 500, 'AccountError');

Err.Gameroom = Err.extend('Game Rooom Error', 500, 'GameRoomError');


module.exports = Err;
