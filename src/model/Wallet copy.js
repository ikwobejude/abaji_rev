const Sequelize = require('sequelize');
const db = require('../db/connection');


const disbursments = db.define('disbursments',{
    transactionReference: {type: Sequelize.STRING}, 
    fee: {type: Sequelize.STRING}, 
    amount: {type: Sequelize.DECIMAL}, 
    transactionDescription: {type: Sequelize.STRING}, 
    destinationAccountNumber: {type: Sequelize.STRING}, 

    sessionId: {type: Sequelize.STRING}, 
    destinationAccountName: {type: Sequelize.STRING}, 
    reference: {type: Sequelize.STRING},
    destinationBankCode: {type: Sequelize.STRING}, 
    narration: {type: Sequelize.STRING},
    currency: {type: Sequelize.STRING},
    destinationBankName: {type: Sequelize.STRING},
    status: {type: Sequelize.STRING},
    id: {
        type: Sequelize.STRING,
        primaryKey: true
    },
    createdOn: {type: Sequelize.DATE},
    completedOn: {type: Sequelize.DATE},
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports = Wallet