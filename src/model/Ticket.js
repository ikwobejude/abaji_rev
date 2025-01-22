const Sequelize = require('sequelize');
const db = require('../db/connection');

const Tickets = db.define('tickets', {
    id:{
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    agent_id:{
        type: Sequelize.STRING
    },
    agent_name:{
        type: Sequelize.STRING
    },
    ticket_type:{
        type: Sequelize.STRING
    },
    location:{
        type: Sequelize.STRING
    },
    office_id:{
        type: Sequelize.STRING
    },
    day:{
        type: Sequelize.STRING
    },
    month:{
        type: Sequelize.STRING
    },
    year:{
        type: Sequelize.STRING
    },
    ticketId:{
        type: Sequelize.STRING
    },
    reference_number:{
        type: Sequelize.STRING
    },
    invoice_number:{
        type: Sequelize.STRING
    },
    created_on:{
        type: Sequelize.DATE
    },
    payment_status:{
        type: Sequelize.TINYINT
    },
    amount: {
        type: Sequelize.DECIMAL(50, 2)
    },
    amount_paid: {
        type: Sequelize.DECIMAL(50, 2)
    },
    payment_date:{
        type: Sequelize.DATE
    },
    batch: { type: Sequelize.STRING }
},{
    timestamps: false,
    freezeTableName: true,
});

module.exports = Tickets