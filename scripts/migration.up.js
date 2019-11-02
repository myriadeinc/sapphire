#!/usr/bin/env node
'use strict';

const path = require('path');
const rootPath = path.resolve(`${__dirname}/..`);
require('app-module-path').addPath(rootPath);

const _ = require('lodash');
const db = require('src/util/db.js');
const logger = require('src/util/logger.js');

const config = require('nconf')
    .argv()
    .env({ lowerCase: true, separator: '__' })
    .file('environment', { file: `config/${process.env.NODE_ENV}.json` })
    .file('defaults', { file: 'config/default.json' });

db.init(config.get('db'), logger.db)
    .then(() => {
        return db.migrate(config.get('db'), logger.db);
    })
    .then(() => {
       logger.db.info('Successfully ran migrations:');
    })
    .then(() => {
        logger.db.info('Wrote job status');
        process.exit(0);
    })
    .catch((err) => {
        logger.db.info(err);
    });