const Sequelize = require("sequelize");
const db = require("../db/connection");

const certificateRequestsRecord = db.define(
  "yearly_certificate_requests_record",
  {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    tin: {
      type: Sequelize.STRING,
    },
    year: {
      type: Sequelize.CHAR(4),
    },
    revenue: {
      type: Sequelize.DECIMAL(20, 2),
    },
    assessment_profit_lost: {
      type: Sequelize.DECIMAL(20, 2),
    },
    total_profit: {
      type: Sequelize.DECIMAL(20, 2),
    },
    tax_payable: {
      type: Sequelize.DECIMAL(20, 2),
    },
    outstanding: {
      type: Sequelize.DECIMAL(20, 2),
    },
    batch: {
      type: Sequelize.STRING,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    service_id: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps : false,
    freezeTableName: true,
  }
);

module.exports = certificateRequestsRecord;
