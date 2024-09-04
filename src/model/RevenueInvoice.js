const Sequelize = require('sequelize');
const db = require('../db/connection');

const RevenuesInvoices = db.define('revenue_invoices',{
    revenue_invoice_id:{
        type: Sequelize.BIGINT(20),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    ref_no:Sequelize.STRING(100),
    tin:Sequelize.STRING(45),
    taxpayer_name:Sequelize.STRING(255),
    revenue_id:Sequelize.TEXT,
    description: Sequelize.TEXT,
    amount: Sequelize.DECIMAL(50),
    amount_paid: Sequelize.DECIMAL(50),
    date_log: Sequelize.DATE,
    day: Sequelize.STRING(100),
    month: Sequelize.STRING(100),
    year: Sequelize.STRING(100),
    entered_by: Sequelize.STRING(100),
    invoice_number: Sequelize.STRING(100),
    paid: Sequelize.TINYINT(1),
    service_id: Sequelize.STRING(45),
    registered_by: Sequelize.STRING(55),
    registered_on: Sequelize.DATE,
    source: Sequelize.STRING(455),
    zone_id: Sequelize.STRING(115),
    session_id: Sequelize.STRING(115),
    amount_remaining: Sequelize.DECIMAL(50),
    authorized: Sequelize.TINYINT(1),
    authorized_by: Sequelize.STRING(55),
    rebet: Sequelize.TINYINT(1),
    prev_amount: Sequelize.DECIMAL(50),
    discount: Sequelize.DECIMAL(50),
    batch: Sequelize.STRING(50),
    tax_office: Sequelize.STRING(50),
    ward: Sequelize.STRING(50),
    business_tag: Sequelize.STRING(55),
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

module.exports = RevenuesInvoices