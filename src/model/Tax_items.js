const Sequelize = require('sequelize');
const db = require('../db/connection');

const Tax_items = db.define('tax_items', {
    id:{
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    idtax :{
        type: Sequelize.STRING,
    },
    taxcode:{type: Sequelize.STRING},
    taxitem:{type: Sequelize.STRING},
    amount:{type: Sequelize.STRING},
    business_tag:{type: Sequelize.STRING},
    taxyear:{type: Sequelize.STRING},
    created_on:{type: Sequelize.DATE},
    revenue_code:{type: Sequelize.STRING},
    type:{type: Sequelize.STRING},
    service_id:{type: Sequelize.STRING},
    tax_office:{type: Sequelize.STRING},
    invoice_number:{
        type: Sequelize.STRING(250),
        unique: true
    },
    payment_status:{type: Sequelize.TINYINT},
    discount:{type: Sequelize.DECIMAL},
    batch:{type: Sequelize.STRING},
    firstlevel:{type: Sequelize.TINYINT},
    secondlevel:{type: Sequelize.TINYINT},
    thirdlevel:{type: Sequelize.TINYINT},
    rrr:{type: Sequelize.STRING},
    amount_paid: {type: Sequelize.DECIMAL}
},{
    timestamps : false,
    freezeTableName: true,
});
module.exports = Tax_items

