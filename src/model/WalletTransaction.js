const Sequelize = require('sequelize');
const db = require('../db/connection');


const WalletTransaction = db.define('wallettransaction',{
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {type: Sequelize.STRING}, 
    isInflow: {type: Sequelize.STRING}, 
    paymentMethod: {type: Sequelize.STRING}, 
    currency: {type: Sequelize.STRING}, 
    amount: {type: Sequelize.STRING}, 
    walletid: {type: Sequelize.STRING}, 
    transactionid: {type: Sequelize.STRING}, 
    created_on: {type: Sequelize.STRING}, 
    status: {type: Sequelize.STRING}, 

   
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports = WalletTransaction