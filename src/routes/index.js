"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */

router.use("/miner", require("src/routes/miner.router.js"));
router.use("/credit", require("src/routes/credit.router.js"));
router.use("/stats", require("src/routes/stats.router.js"));
router.use("/god", require("src/routes/god.router.js"));

module.exports = router;
