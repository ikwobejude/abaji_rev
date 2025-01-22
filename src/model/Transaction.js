const Sequelize = require('sequelize');
const db = require('../db/connection');


const Transaction = db.define('transaction',{
    userId: {type: Sequelize.STRING},
    transactionId: {type: Sequelize.STRING},
    name : {type: Sequelize.STRING},
    email : {type: Sequelize.STRING},
    phone : {type: Sequelize.STRING},
    amount : {type: Sequelize.DECIMAL},
    currency : {type: Sequelize.STRING},
    paymentStatus : {type: Sequelize.STRING},
    paymentGateway : {type: Sequelize.STRING},
    id : {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    created_on: {type: Sequelize.DATE},
    isInflow: {type: Sequelize.TINYINT}, 
    topitby: {type: Sequelize.STRING},
    description: {type: Sequelize.TEXT}
}, {
    freezeTableName: true,
    timestamps: false
})


module.exports = Transaction



