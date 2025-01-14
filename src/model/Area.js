const Sequelize = require("sequelize");
const db = require("../db/connection");

const Areas = db.define(
  "areas",
  {
    areaname: {
      type: Sequelize.STRING(255),
    },
    area_code: {
      type: Sequelize.STRING(45),
    },
    lga_id: {
      type: Sequelize.STRING(20),
    },
    service_id: {
      type: Sequelize.STRING(45),
    },
    updated_at: {
      type: Sequelize.DATE,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: { type: Sequelize.DATE },
    created_by: { type: Sequelize.STRING(45) },
  },
  {
    timestamps: false,
  }
);

module.exports = Areas;
