const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Areas = sequelize.define('areas',{
    Id:{
        type: DataTypes.BIGINT(20),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    areaname: DataTypes.STRING,
    created_by: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_by: DataTypes.STRING,
    updated_at: DataTypes.DATE,
    organization_id: DataTypes.STRING(150),
    ward_id: DataTypes.INTEGER(11),
    service_id: DataTypes.STRING,
    area_code: DataTypes.STRING,
    lga_id: DataTypes.INTEGER
},{
    timestamps : false,
    freezeTableName: true,
});
  
module.exports = Areas
