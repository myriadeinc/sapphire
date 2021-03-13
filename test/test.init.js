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


const cache = require('src/util/cache.js');

// initialize DB
const db = require('src/util/db.js');
const redisUrl = config.get("redis") || 'redis://localhost:6379'

const cacheReady = cache.init({
    url: redisUrl
});

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
    return dbReady
        .then(async () => {
            await db.close();
            await cache.close();
        })
        .catch(err => process.exit(57))

});

module.exports = {
    config: config,
    db: db,
    dbReady: dbReady,
    cacheReady: cacheReady,
    should: should
};
