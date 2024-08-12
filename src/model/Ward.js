const Sequelize = require('sequelize');
const db = require('../db/connection');

const Wards = db.define('_cities', {
    city_id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    city: {
        type: Sequelize.STRING(45),
    },
    city_code: {
        type: Sequelize.STRING(45)
    },
    lga_id: {
        type: Sequelize.BIGINT(20),
    },
    created_at: {
        type: Sequelize.DATE,
    },
    updated_at: {
        type: Sequelize.DATE,
    },
    tax_office_id: {type: Sequelize.STRING(45)},
    service_id: {type: Sequelize.STRING(45)}
}, {
    timestamps: false
});

module.exports = Wards