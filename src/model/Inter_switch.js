const { DataTypes } = require("sequelize");
const db = require("../db/connection");

const Interswitch = db.define(
  "inter_switch_credentials",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    mid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    service_id: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    created_by: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    freezetableName: true,
    timestamps: false,
  }
);

module.exports = Interswitch;
