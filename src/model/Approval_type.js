const Sequelize = require("sequelize");
const db = require("../db/connection");

const TotalApprovalType = db.define(
  "total_approval_type",
  {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    approval_type: {
      type: Sequelize.STRING(50),
    },
    total_number_of_approval: {
      type: Sequelize.INTEGER,
    },
    service_id: {
      type: Sequelize.STRING(50),
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = TotalApprovalType;
