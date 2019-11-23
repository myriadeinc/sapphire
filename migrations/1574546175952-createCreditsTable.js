'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return createCreditsTable(queryInterface, schema, Sequelize);

    },
    
    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable({ tableName: 'Credits', schema });
        });
    }
};

const createCreditsTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.createTable(
        'Credits',
        {
            id: {
                type: Sequelize.BIGINT,
                unique: true,
                primaryKey: true,
                autoIncrement: false
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
            credit: {
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
