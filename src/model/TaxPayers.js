const Sequelize = require('sequelize');
const db = require('../db/connection');


const TaxPayers = db.define('tax_payers',{
    taxpayer_id: {type: Sequelize.STRING}, 
    taxpayer_rin: {type: Sequelize.STRING}, 
    taxpayer_name: {type: Sequelize.STRING}, 
    taxpayer_tin: {type: Sequelize.STRING}, 
    mobile_number: {type: Sequelize.STRING}, 
    email_addresss: {type: Sequelize.STRING}, 
    tax_office: {type: Sequelize.STRING}, 
    tax_payer_type: {type: Sequelize.STRING},
    economic_activity: {type: Sequelize.STRING}, 
    preferred_notification_method: {type: Sequelize.STRING},
    tax_payer_status: {type: Sequelize.STRING},
    account_balance: {type: Sequelize.STRING},
    service_id: {type: Sequelize.STRING},
    contactaddress: {type: Sequelize.STRING},
    organization_id: {type: Sequelize.STRING},
    photo_url: {type: Sequelize.STRING},
    rcc: {type: Sequelize.STRING},
    bvn: {type: Sequelize.STRING},
    nin: {type: Sequelize.STRING},
    created_on: {type: Sequelize.DATE},
}, {
    freezeTableName: true,
    timestamps: false
})

module.exports = TaxPayers