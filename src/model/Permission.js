const Sequelize = require('sequelize');
const db = require('../db/connection');

const Permissions = db.define('permissions',{
    permission_id:{
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    permission_name: Sequelize.STRING(45),
    role_id: Sequelize.INTEGER,
    created_on: Sequelize.DATE
},{
    timestamps: false,
    freezeTableName: true,
});

module.exports = Permissions;