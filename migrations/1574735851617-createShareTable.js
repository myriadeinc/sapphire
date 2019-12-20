'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return createShareTable(queryInterface, schema, Sequelize);

    },
    
    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable({ tableName: 'Shares', schema });
        });
    }
};

const createShareTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.createTable(
        'Shares',
        {
            id: {
                type: Sequelize.BIGINT,
                unique: true,
                primaryKey: true,
                autoIncrement: true
            },
        
            minerId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Miners',
                    key: 'id'
                }
            },
        
            share: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
        
            difficulty: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            
            blockHeight: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
        
            time: {
                type: Sequelize.DATE,
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
