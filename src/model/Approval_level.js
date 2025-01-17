const Sequelize = require("sequelize");
const db = require("../db/connection");

const ApprovalLevels = db.define(
  "approval_levels",
  {
    level_id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    sequence_number: {
      type: Sequelize.INTEGER,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    application_type: {
      type: Sequelize.STRING(255),
    },
    designation: {
      type: Sequelize.STRING(50),
    },
    service_id: {
      type: Sequelize.STRING(255),
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ApprovalLevels;
