"use strict";
/*eslint-disable */
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
/* eslint-enable */
const AuthMiddleware = require("src/middleware/auth.middleware.js");
const CreditEventService = require("src/service/credit.event.service.js");
const config = require("src/util/config.js");
const logger = require("src/util/logger.js").db;

router.get("/active", async (req, res) => {
    try {
        const entries = await CreditEventService.getActiveContent();

        if (
            req.headers.authorization &&
            req.headers.authorization.split(" ")[0] === "SharedSecret" &&
            config.get("service:shared_secret") ===
            req.headers.authorization.split(" ")[1]
        ) {
            return res.status(200).send(entries.map(entry => ({
                id: entry.id,
                public: entry.data,
                private: {
                    usdRate: 1, //this is a temp value
                    changePriceFactor: 1 //this is a temp value
                }
            })));
        }

        return res.status(200).send(entries.map(entry => ({
            id: entry.id,
            public: entry.data,
        })));
    }
    catch (e) {
        logger.error(e)
        return res.status(500).send({ error: 'ERROR FETCHING EVENT CONTENT', code: 500 })
    }
})

router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const entries = await CreditEventService.getActiveContent();
        let entry = entries.find(entry => entry.id == id);

        entry = {
            id: entry.id,
            public: entry.data
        }

        if (
            req.headers.authorization &&
            req.headers.authorization.split(" ")[0] === "SharedSecret" &&
            config.get("service:shared_secret") ===
            req.headers.authorization.split(" ")[1]
        ) {
            entry.private = {
                usdRate: 1, //this is a temp value
                changePriceFactor: 1 //this is a temp value
            };
        }

        return res.status(200).send(entry)
    }
    catch (e) {
        logger.error(e)
        return res.status(500).send({ error: 'ERROR FETCHING EVENT CONTENT', code: 500 })
    }
})

router.post("/create", async (req, res) => {
    try {
        await CreditEventService.createEvent(req.body.data, req.body.tags);
        return res.status(200).send('OK')
    }
    catch (e) {
        logger.error(e)
        return res.status(500).send({ error: 'ERROR CREATING EVENT CONTENT', code: 500 })
    }
})

module.exports = router;