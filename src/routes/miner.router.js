'use strict';
/*eslint-disable */
const router = require('express').Router();
/* eslint-enable */

const AuthMiddleware = require('src/middleware/auth.middleware.js');

const MinerSchema = require('src/schemas/miner.schema.js');
const { ApolloServer } = require('apollo-server-express');

const graphQLServer = new ApolloServer(MinerSchema);

router.use('/', AuthMiddleware.validateMinerId)

graphQLServer.applyMiddleware({ app: router, path: '/' });


module.exports = router;