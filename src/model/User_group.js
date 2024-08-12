const Sequelize = require('sequelize');
const db = require('../db/connection');

const User_groups = db.define('user_groups', {
    idgroups:{
        type: Sequelize.BIGINT(20),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
    }, 
    group_id: Sequelize.BIGINT(20),
    group_name: Sequelize.STRING
},{
    freezeTableName: true,
    timestamps: false
});


module.exports = User_groups