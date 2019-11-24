'use strict';
/*eslint-disable */
const router = require('express').Router();
/* eslint-enable */

router.use('/report', require('src/routes/report.router.js' ));
router.use('/miner', require('src/routes/miner.router.js'));
module.exports = router;
