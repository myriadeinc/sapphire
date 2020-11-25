"use strict";

const DB = require("src/util/db.js");
const CreditEventModel = require("src/models/credit.event.model.js");

const EventCmsModel = DB.sequelize.define(
  "EventCMS",
  {
    id: {
      type: DB.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    data: {
      type: DB.Sequelize.JSONB,
    },
    tags: {
      type: DB.Sequelize.STRING,
      allowNull: false,
    },
    status: {
      type: DB.Sequelize.INTEGER,
      defaultValue: 0
    }
  },
  {
    paranoid: true,
  }
);
EventCmsModel.hasMany(CreditEventModel, { foreignKey: "contentId", targetKey: "id" });

module.exports = EventCmsModel;
