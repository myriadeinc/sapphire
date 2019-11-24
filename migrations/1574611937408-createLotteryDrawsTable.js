'use strict';

const Migration = {

    up: (queryInterface, schema, Sequelize) => {
        return createLotteryDrawsTable(queryInterface, schema, Sequelize)
        .then(res => {
            return createMinerLotterydrawsThroughTable(queryInterface, schema, Sequelize);
        })
    },
    
    down: (queryInterface, schema, Sequelize) => {
        return queryInterface.sequelize.transaction(async (transaction) => {
            await queryInterface.dropTable({ tableName: 'MinerLotteryDraws', schema});
            await queryInterface.dropTable({ tableName: 'LotteryDraws', schema });
        });
    }
};

const createLotteryDrawsTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.createTable(
        'LotteryDraws',
        {
            id: {
                type: Sequelize.BIGINT,
                unique: true,
                primaryKey: true,
                autoIncrement: true
            },
            pot: {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 0,
            },
        
            draw_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
        
            is_active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: true
            },
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
            deletedAt: { type: Sequelize.DATE }
        },{
            schema: schema
        }
    );
};

const createMinerLotterydrawsThroughTable = (queryInstance, schema, Sequelize) => {
    return queryInstance.createTable(
        'MinerLotteryDraws',
        {
            id: {
                type: Sequelize.BIGINT,
                unique: true,
                primaryKey: true,
                autoIncrement: true
            },
            minerId: {
                type: Sequelize.UUID
            },
            drawId: {
                type: Sequelize.BIGINT
            },
            createdAt: { type: Sequelize.DATE },
            updatedAt: { type: Sequelize.DATE },
            deletedAt: { type: Sequelize.DATE }
        },{
            schema
        }
    )
}

module.exports = Migration;
