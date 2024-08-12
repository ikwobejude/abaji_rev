const Sequelize = require('sequelize');
const db = require('../db/connection');

const Invoice_number_count = db.define('invoice_number_count', {
    invoice_number:{
        type: Sequelize.BIGINT(11),
        primaryKey: true
    }
},{
    timestamps: false,
    freezeTableName: true,
});

module.exports = Invoice_number_count