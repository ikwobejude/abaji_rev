const Sequelize = require('sequelize');
const db = require('../db/connection');

const Tax_offices = db.define('tax_offices',{
    id_tax_office:{
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    tax_office_id:{
        type: Sequelize.STRING,
    },
    tax_office:{
        type: Sequelize.STRING
    },
    service_id:{
        type: Sequelize.STRING,
    },
    created_by:{
        type: Sequelize.STRING,
    },
    created_at:{
        type: Sequelize.DATE,
    },
    updated_by:{
        type: Sequelize.STRING,
    },
    updated_at:{
        type: Sequelize.DATE,
    },
    organization_id:{
        type: Sequelize.STRING,
    },
    office_address: {type: Sequelize.STRING,},
    phone_number: {type: Sequelize.STRING,},
    userid: {type: Sequelize.STRING,}
},{
    timestamps: false,
    freezeTableName: true,
});

module.exports = Tax_offices;