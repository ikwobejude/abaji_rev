const { DataTypes } = require("sequelize");
const db = require("../db/connection");

const clientService = db.define(
  "clients",
  {
    idclient_services: {
      type: DataTypes.INTEGER(20),
      autoIncrement: true,
      primaryKey: true,
      allowNull: true,
    },
    client: DataTypes.STRING,
    service_id: DataTypes.STRING(100),
    country_code: DataTypes.STRING,
    service_code: DataTypes.STRING,
    client_phone: { type: DataTypes.STRING, unique: true },
    client_address: DataTypes.STRING,
    client_email: DataTypes.STRING,
    client_admin: DataTypes.STRING,
    client_admin_email: DataTypes.STRING,
    client_admin_pwd: DataTypes.STRING,
    // authorized: DataTypes.TINYINT,
    // reason: DataTypes.STRING,
    service_logo: DataTypes.STRING,
    setup_on: DataTypes.DATE,
    authorized_by: DataTypes.STRING,
    authorized_on: DataTypes.DATE,
    admin_first_use: DataTypes.TINYINT,
    service_status: DataTypes.TINYINT,
    country: DataTypes.STRING,
    state: DataTypes.STRING,
    city: DataTypes.STRING,
    lga: DataTypes.STRING,
    admin_firstname: DataTypes.STRING,
    admin_middlename: DataTypes.STRING,
    admin_surname: DataTypes.STRING,
    created_by: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_by: DataTypes.STRING,
    updated_at: DataTypes.DATE,
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = clientService;
