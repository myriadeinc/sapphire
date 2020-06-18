'use strict';

const path = require('path');

const rootPath = path.resolve(`${__dirname}/../`);
require('app-module-path').addPath(rootPath);

const logger = require('src/util/logger.js');
// initialize config
const configPath = path.resolve(`${rootPath}/config`);
const config = require('nconf')
    .argv()
    .env({ lowerCase: true, separator: '__' })
    .file('testing', { file: `${rootPath}/test/config/testing.json` })
    .file('environment', { file: `${configPath}/${process.env.NODE_ENV}.json` })
    .file('defaults', { file: `${configPath}/default.json` });

// initialize DB
const db = require('src/util/db.js');

const dbReady = db.init(config.get('db'), logger.db)
    .then(() => {
        return db.migrate();
    });

// other libs
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-string'))
    .should();

// Mocha won't catch unhandled promise rejections.
// Catch them, and die on them, in a noisy, violent manner.
process.on('unhandledRejection', (reason, promise) => {
    /* eslint-disable no-console */
    console.error('Unhandled promise rejection:');
    console.error(reason);
    process.exit(57);
    // If you noticed an exit code of 57, and grepped for it, now you know why.
    /* eslint-enable no-console */
});


after('Cleanup', () => {
    return Promise.all([
        dbReady.then(() => { return db.close(); }),
    ]);
});

module.exports = {
    config: config,
    db: db,
    dbReady: dbReady,
    should: should
};
