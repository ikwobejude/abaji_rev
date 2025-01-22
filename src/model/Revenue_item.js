const Sequelize = require('sequelize');
const db = require('../db/connection');

const Revenue_item = db.define('revenue_item', {
    itemID:{
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    code:{
        type: Sequelize.STRING(250)
    },
    revenue_line:{
        type: Sequelize.STRING(250)
    },
    item_code: {type: Sequelize.STRING },
    revenue_item:{
        type: Sequelize.STRING(250)
    },
    area:{
        type: Sequelize.STRING(250)
    },
    size: {
        type: Sequelize.STRING(250)
    },
    amount: {
        type: Sequelize.DECIMAL(50, 2)
    },
    service_id: {type: Sequelize.STRING(250) },
    rate_year: {type: Sequelize.STRING(250) }
},{
    timestamps : false,
    freezeTableName: true,
});

module.exports = Revenue_item

