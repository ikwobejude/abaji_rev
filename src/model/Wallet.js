const Sequelize = require('sequelize');
const db = require('../db/connection');


const wallet = db.define('wallet',{
    walletid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true

    },
    userId: {type: Sequelize.STRING},
    balance : {type: Sequelize.STRING},
    created_on : {type: Sequelize.STRING},
    idwallent : {type: Sequelize.STRING},
   
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports = wallet