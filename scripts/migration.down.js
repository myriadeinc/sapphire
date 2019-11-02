'use strict';

const path = require('path');
const rootPath = path.resolve(`${__dirname}/..`);
require('app-module-path').addPath(rootPath);

const _ = require('lodash');
const db = require('src/util/db.js');

// Fail quickly if no version was supplied
const args = process.argv.slice(2);
if (_.isEmpty(args)) {
    logger.db.error('Please supply a version to rollback to.');
    process.exit(1);
}

// Load config for the environment
const config = require('nconf')
    .argv()
    .env({ lowerCase: true, separator: '__' })
    .file('environment', { file: `config/${process.env.NODE_ENV}.json` })
    .file('defaults', { file: 'config/default.json' });

db.init(config.get('db'), logger.db)
    .then(() => {
        return db.umzug.executed();
    })
    .then((migrations) => {
        const matchingMigration = _.filter(migrations, (migration) => {
            return _.startsWith(migration.file, args[0]);
        });

        if (matchingMigration.length !== 1) {
            const message = `Failed to find a migration matching version: ${args[0]}`;
            logger.db.info(message);

        }
        logger.db.info(`found matching migration ${JSON.stringify(matchingMigration)}`);
        return db.umzug.down({ to: matchingMigration[0].file });
    })
    .then((migrations) => {
        const migrationFiles = _.map(migrations, (migration) => {
            return migration.file;
        });
        logger.db.info(`Successfully rolled back migrations: ${_.join(migrationFiles, ', ')}`);

    })
    .catch((err) => {
        logger.db.error(err);
    });