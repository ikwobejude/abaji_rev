const Sequelize = require('sequelize');
const db = require('../db/connection');

const State = db.define('_state',{
    state_id:{
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    state:{
        type: Sequelize.STRING(45),
    },
    state_code:{
        type: Sequelize.STRING(45)
    },
    country_id:{
        type: Sequelize.INTEGER(20),
    }
},{
    timestamps: false
});

module.exports = State