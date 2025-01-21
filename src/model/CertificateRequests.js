const Sequelize = require("sequelize");
const db = require("../db/connection");

const CertificateRequests = db.define(
  "certificate_requests",
  {
    request_id: {
      type: Sequelize.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    taxpayer_name: {
      type: Sequelize.STRING,
    },
    taxpayer_id: {
      type: Sequelize.STRING,
    },
    request_date: {
      type: Sequelize.DATE,
    },
    start_year: {
      type: Sequelize.CHAR(4),
    },
    end_year: {
      type: Sequelize.CHAR(4),
    },
    status: {
      type: Sequelize.ENUM('PENDING','APPROVED','DENIED'),
    },
    remarks: {
      type: Sequelize.STRING,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
    service_id: {
      type: Sequelize.STRING,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = CertificateRequests;
