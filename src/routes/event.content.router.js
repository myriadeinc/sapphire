"use strict";
/*eslint-disable */
const router = require("express").Router();
const { check, validationResult } = require("express-validator");
/* eslint-enable */

const AuthMiddleware = require("src/middleware/auth.middleware.js");
const CreditEventService = require("src/service/credit.event.service.js");
const logger = require("src/util/logger.js").db;

router.get("/active", async (req, res) => {
    try {
        // const entries = await CreditEventService.getActiveContent();
        const entries = [
            {
                id: 57,
                public: {
                    title: "One Person Raffle",
                    description: "One Entry, one winner chosen at random",
                    entryPrice: 100,
                    prizeAmount: 10000,
                    rules: {
                        priceType: "static",
                        lateExit: false
                    },
                    expiry: Date.now()
                },
                private: {
                    usdRate: "10.59",
                    changePriceFactor: "1.5",
                },
            },
            {
                id: 98,
                public: {
                    title: "Five Person Raffle",
                    description: "Five Entries, one winner chosen at random",
                    entryPrice: 100,
                    prizeAmount: 10000,
                    rules: {
                        priceType: "static",
                        lateExit: false
                    },
                    expiry: Date.now()
                },
                private: {
                    usdRate: "10.59",
                    changePriceFactor: "1.5",
                },
            },
            {
                id: 992,
                public: {
                    title: "Ten Person Raffle",
                    description: "Ten Entries, one winner chosen at random",
                    entryPrice: 100,
                    prizeAmount: 10000,
                    rules: {
                        priceType: "static",
                        lateExit: false
                    },
                    expiry: Date.now()
                },
                private: {
                    usdRate: "10.59",
                    changePriceFactor: "1.5",
                },
            }

        ]
        return res.status(200).send(entries)
    }
    catch (e) {
        logger.error(e)
        return res.status(500).send({ error: 'ERROR FETCHING EVENT CONTENT', code: 500 })
    }
})


router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        // const entries = await CreditEventService.getActiveContent();
        const entry =
        {
            id,
            public: {
                title: "Ten Person Raffle",
                description: "Ten Entries, one winner chosen at random",
                entryPrice: 100,
                prizeAmount: 10000,
                rules: {
                    priceType: "static",
                    lateExit: false
                },
                expiry: Date.now(),
                winner: "3e9ba499-9c9e-45df-b76d-7d2eef040c3a"

            },
            private: {
                usdRate: "10.59",
                changePriceFactor: "1.5",
            },
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