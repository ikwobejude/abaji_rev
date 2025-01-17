const Sequelize = require("sequelize");
const db = require("../db/connection");

const ApprovalLevels = db.define(
  "accounts",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lga_account_name: Sequelize.STRING,
    lga_account_number: Sequelize.STRING,
    lga_bank_name: Sequelize.STRING,
    approval_status: Sequelize.BOOLEAN,
    approved_by: Sequelize.INTEGER,
    created_by: Sequelize.STRING,
    service_id: Sequelize.STRING,
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = ApprovalLevels;
