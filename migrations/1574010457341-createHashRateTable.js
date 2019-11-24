'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return createHashrateTable(queryInterface, schema, Sequelize);

    },
    
    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable({ tableName: 'Hashrates', schema });
        });
    }
};

const createHashrateTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.createTable(
        'Hashrates',
        {
            id: {
                type: Sequelize.BIGINT,
                unique: true,
                primaryKey: true,
                autoIncrement: true
            },
            minerId: {
                type: Sequelize.UUID,
                references: {
                    model: 'Miners',
                    key: 'id'
                }
            },
            time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            rate: {
                type: Sequelize.BIGINT,
                allowNull: false
            },    
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
            deletedAt: { type: Sequelize.DATE }
        },{
            schema: schema
        }
    );
};

module.exports = Migration;
