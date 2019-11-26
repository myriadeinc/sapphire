'use strict';
/*eslint-disable */
const router = require('express').Router();
/* eslint-enable */

router.use('/miner', require('src/routes/miner.router.js'));
module.exports = router;
