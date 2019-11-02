'use strict';
const path = require('path');
const rootPath = path.resolve(`${__dirname}/..`);
require('app-module-path').addPath(rootPath);
const fs = require('fs');
const _ = require('lodash');

// The migration directory location underneath is with respect to the root directory
const MigrationDirectory = './migrations';

const args = process.argv.slice(2);
if (_.isEmpty(args)) {
    console.log('[ERROR] Please supply a migration name.');
    return;
}

const newMigrationName = `${Date.now()}-${args[0]}.js`;
console.log(`Generating migration file: ${newMigrationName}`);

const baseMigration = `\
'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction((transaction) => {

        })
    },

    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction((transaction) => {

        });
    }
};

module.exports = Migration;
`;

fs.writeFileSync(`${MigrationDirectory}/${newMigrationName}`, baseMigration);
console.log(`Successfully generated migration file: ${newMigrationName}`);