"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */

router.use("/miner", require("src/routes/miner.router.js"));
router.use("/credits", require("src/routes/credit.event.router.js"));
router.use("/eventContent", require("src/routes/event.content.router.js"));
router.use("/stats", require("src/routes/stats.router.js"));
router.use("/god", require("src/routes/god.router.js"));

module.exports = router;