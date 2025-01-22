const Sequelize = require('sequelize');
const db = require('../db/connection');

const Revenues_invoices = db.define('revenue_invoices',{
    revenue_invoice_id:{
        type: Sequelize.INTEGER(20)
    },
    ref_no:{
        type: Sequelize.STRING(100),
        allowNull: true
    },
    tin:{
        type: Sequelize.STRING(45)
    },
    taxpayer_name:{
        type: Sequelize.STRING(255)
    },
    revenue_id:{
        type: Sequelize.TEXT
    },
    description:{
        type: Sequelize.TEXT
    },
    amount:{
        type: Sequelize.DECIMAL(50),
        decimals: 2,
        allowNull: true
    },
    amount_paid:{
        type: Sequelize.DECIMAL(50),
        decimals: 2,
    },
    date_log:{
        type: Sequelize.DATE
    },
    day:{
        type: Sequelize.STRING(100)
    },
    month:{
        type: Sequelize.STRING(100)
    },
    year:{
        type: Sequelize.STRING(100)
    },
    entered_by:{
        type: Sequelize.STRING(100)
    },
    invoice_number:{
        type: Sequelize.STRING(100),
        allowNull: true
    },
    paid:{
        type: Sequelize.TINYINT(1)
    },
    service_id:{
        type: Sequelize.STRING(45)
    },
    registered_by:{
        type: Sequelize.STRING(55)
    },
    registered_on:{
        type: Sequelize.DATE
    },
    source:{
        type: Sequelize.STRING(455)
    },
    zone_id:{
        type: Sequelize.STRING(115)
    },
    session_id:{
        type: Sequelize.STRING(115)
    },
    amount_remaining:{
        type: Sequelize.DECIMAL(50),
        decimals: 2,
    },
    authorized:{
        type: Sequelize.TINYINT(1)
    },
    authorized_by:{
        type: Sequelize.STRING(55)
    },
    rebet:{
        type: Sequelize.TINYINT(1)
    },
    prev_amount:{
        type: Sequelize.DECIMAL(50),
        decimals: 2,
        allowNull: true
    },
    discount: {
        type: Sequelize.DECIMAL(50),
        decimals: 2
    },
    batch: {
        type: Sequelize.STRING(50)
    },
    tax_office: { type: Sequelize.STRING(50) },
    business_tag: { type: Sequelize.STRING(55)},
    payment_date: { type: Sequelize.DATE},
    RevenueHeadName: Sequelize.STRING,
    ExternalRefNumber: Sequelize.STRING,
    PaymentURL: Sequelize.TEXT,
    Description1: Sequelize.STRING,
    RequestReference: Sequelize.STRING,
    AmountDue: Sequelize.DECIMAL(20, 2),
    InvoicePreviewUrl: Sequelize.TEXT,
},{
    timestamps : false,
    freezeTableName: true,
});

module.exports = Revenues_invoices