const Sequelize = require('sequelize');
const db = require('../db/connection');


const TransactionHistory = db.define('transactionhistory',{
    paymentid:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    status: {type: Sequelize.STRING}, 
    message: {type: Sequelize.STRING}, 
    transactionReference: {type: Sequelize.STRING}, 
    paymentReference: {type: Sequelize.STRING}, 
    authorizedAmount: {type: Sequelize.DECIMAL}, 
    transactiondate: {type: Sequelize.DATE},
    invoice_number: {type: Sequelize.STRING}, 
    paymentType: {type: Sequelize.STRING}
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports = TransactionHistory