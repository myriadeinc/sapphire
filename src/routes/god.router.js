"use strict";
/*eslint-disable */
const router = require("express").Router();
/* eslint-enable */

const AuthMiddleware = require("src/middleware/auth.middleware.js");
// router.use('/', AuthMiddleware.authenticateSharedSecret);

/**
 * Credit Event has no validation check ... yet
 */
router.post("/eventCreate", [], async (req, res) => {
    console.dir(req.body);
    return res.status(200).send('ok');
});


module.exports = router;