'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Sequelize = require('sequelize');
const Umzug = require('umzug');

delete require('pg').native;


const getOptions = (opt, log) => {
  if (opt.dialect_options) {
    opt.dialectOptions = opt.dialect_options;
    delete opt.dialect_options;
  }

  const Options = _.defaults({}, opt, {
    dialect: 'postgres',
    database: 'postgres',
    username: null,
    password: null,
    logging: false,
    define: {
      freezeTableName: true,
      paranoid: true,
      timestamps: true,
    },
    migrations: {
      model_name: 'Migration',
    },
    operatorsAliases: false,
  });

  Options.define.schema = Options.schema;
  delete Options.schema;

  if (Options.logging && log) {
    Options.logging = log;
  }
  return Options;
};

const initSchema = async (opt, log) => {
  const schemaName = opt.schema;
  const res = await DB.sequelize.query(`SELECT schema_name FROM `+
  ` information_schema.schemata `+
  `WHERE schema_name = '${schemaName}'`,
  {type: DB.sequelize.QueryTypes.SELECT});

  if (0 === res.length) {
    log.info(`Schema ${schemaName} does not exist, creating it now`);
    await DB.sequelize.createSchema(`"${schemaName}"`);
  }
};

const initModels = async (modelPath, log) => {
  const modelFiles = fs.readdirSync(modelPath);
  for (const file of modelFiles) {
    const filePath = path.resolve(modelPath, file);
    try {
      const model = require(filePath);
      if (model.sequelize && model.name) {
        DB.Model[model.name] = model;
        log.info('Loaded DB model:', model.name);
      }
    } catch (err) {
      log.info('Unable to load DB model');
      log.error(err);
    }
  }
};

const initMigrationModel = (opt) => {
  DB.MigrationModel = DB.sequelize.define(opt.migrations.model_name, {
    migration: {
      type: DB.Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    },
  }, {
    createdAt: 'executedAt',
    updatedAt: false,
    paranoid: false,
  });
};

const initUmzug = (opt, log) => {
  let pattern = /^\d+-.*\.js$/;
  if (opt.migrations.pattern) {
    try {
      pattern = RegExp(opt.pattern);
    } catch (e) {
      throw new Error(
          `Database config value `+
        `migrations:pattern must be a valid`+
        ` regular expression: ${e.message}`
      );
    }
  }

  DB.umzug = new Umzug({
    storage: 'sequelize',
    logging: log,
    storageOptions: {
      sequelize: DB.sequelize,
      model: DB.MigrationModel,
      modelName: opt.migrations.model_name,
      columnName: 'migration',
    },
    migrations: {
      params: [DB.sequelize.getQueryInterface(), opt.schema, Sequelize],
      path: opt.migrations.path,
      pattern,
    },
  });
};

const DB = {

  Sequelize: Sequelize,
  sequelize: {},
  umzug: {},
  Model: {},

  init: async (opt = null, log = null) => {
    DB.sequelize = new Sequelize(getOptions(opt, log));
    await initSchema(opt, log);
    await initModels(opt.model_path, log);
    await initMigrationModel(opt);
    await initUmzug(opt);
  },

  close: async () => {
    await DB.sequelize.connectionManager.close();
  },

  migrate: async (opt, log) => {
    if (_.isEmpty(DB.umzug)) {
      await initUmzug(opt, log);
    }
    return DB.umzug.up();
  },
};

module.exports = DB;