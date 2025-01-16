const Sequelize = require('sequelize');
const db = require('../db/connection');

const Assessments = db.define('assessments', {
    assessment_id: {
        type: Sequelize.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: true
    },
    assessment_ref: { type: Sequelize.STRING },
    tax_payer_rin: { type: Sequelize.STRING },
    tax_payer_type: { type: Sequelize.STRING },
    tax_payer_name: { type: Sequelize.STRING },
    asset_type: { type: Sequelize.STRING },
    asset_rin: { type: Sequelize.STRING },
    assessment_date: { type: Sequelize.DATE },
    profile_ref: { type: Sequelize.STRING },
    assessment_rule: { type: Sequelize.STRING },
    tax_year: { type: Sequelize.STRING },
    assessment_amount: { type: Sequelize.DECIMAL },
    assessment_amount_remaining: { type: Sequelize.DECIMAL },
    assessment_amount_paid: { type: Sequelize.DECIMAL },
    settlement_due_date: { type: Sequelize.DATE },
    settlement_status: { type: Sequelize.TINYINT },
    settlement_date: { type: Sequelize.DATE },
    settlement_method: { type: Sequelize.STRING },
    service_id: { type: Sequelize.STRING },
    created_by: { type: Sequelize.STRING },
    updated_at: { type: Sequelize.DATE },
    updated_by: { type: Sequelize.STRING },
    cancelled: { type: Sequelize.TINYINT },
    tax_month: { type: Sequelize.STRING },
    assessment_note: { type: Sequelize.STRING },
    invoice_number: { type: Sequelize.STRING },
    data_sync: { type: Sequelize.TINYINT },
}, {
    timestamps: false,
    freezeTableName: true,
});

module.exports = Assessments