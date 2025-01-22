const Sequelize = require('sequelize');
const db = require('../db/connection');

const Lgas = db.define('_lga', {
    lga_id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    lga: {
        type: Sequelize.STRING(50),
    },
    lga_code: {
        type: Sequelize.STRING
    },
    state_id: {
        type: Sequelize.BIGINT(20),
    }
}, {
    timestamps: false,
    freezeTableName: true
});

module.exports = Lgas