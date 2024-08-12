const Sequelize = require('sequelize');
const db = require('../db/connection');

const Streets = db.define('_streets',{
    idstreet:{
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    street:{
        type: Sequelize.STRING(45)
    },
    city_id:{
        type: Sequelize.BIGINT(45)
    },
    latitude:{
        type: Sequelize.STRING(35),
        allowNull: true 
    },
    longitude:{
        type: Sequelize.STRING(35),
        allowNull: true
    },
    street_id:{
        type: Sequelize.BIGINT(45),
        allowNull: true
    },
    service_id:{
        type: Sequelize.STRING(150),
        allowNull: true
    },
    area_id : { type: Sequelize.BIGINT(45),}
   
},{
    timestamps : false,
    freezeTableName: true,
});

module.exports = Streets