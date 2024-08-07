const Sequelize = require('sequelize');
const db = require('../db/connection');

const Users = db.define('users', {
    id:{
        type: Sequelize.BIGINT(20),
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
    }, 
    group_id:{
        type: Sequelize.BIGINT(20)
    }, 
    surname:{
        type: Sequelize.STRING
    }, 
    firstname:{
        type: Sequelize.STRING
    }, 
    middlename:{
        type: Sequelize.STRING
    }, 
    name:{
        type: Sequelize.STRING
    }, 
    username:{
        type: Sequelize.STRING
    }, 
    password:{
        type: Sequelize.STRING
    }, 
    email:{
        type: Sequelize.STRING(100)
    }, 
    user_phone:{
        type: Sequelize.STRING(20)
    }, 
    remember_token:{
        type: Sequelize.STRING
    }, 
    service_id:{
        type: Sequelize.STRING(100),
        allowNull: true
    }, 
    service_code:{
        type: Sequelize.STRING(10)
    }, 
    created_at:{
        type: Sequelize.DATE
    }, 
    updated_at:{
        type: Sequelize.DATE
    }, 
    allowmobilelogin:{
        type: Sequelize.BOOLEAN,
        allowNull: true
    }, 
    allowdesktoplogin:{
        type: Sequelize.BOOLEAN,
        allowNull: true
    }, 
    first_use:{
        type: Sequelize.BOOLEAN,
        allowNull: true
    }, 
    ministry_admin:{
        type: Sequelize.TINYINT(4),
        allowNull: true
    }, 
    admin_ministry_id:{
        type: Sequelize.INTEGER(11)
    }, 
    ministry_supervisor:{
        type: Sequelize.TINYINT(4),
        allowNull: true
    }, 
    supervisor_ministry_id:{
        type: Sequelize.INTEGER(11)
    },
    is_admin:{
        type: Sequelize.TINYINT(4),
        allowNull: true
    }, 
    is_supervisor:{
        type: Sequelize.TINYINT(4),
        allowNull: true
    }, 
    prev_username:{
        type: Sequelize.STRING(45)
    }, 
    updated_by:{
        type: Sequelize.STRING
    }, 
    registered_on:{
        type: Sequelize.DATE
    }, 
    inactive:{
        type: Sequelize.BOOLEAN,
        allowNull: true
    }, 
    created_by:{
        type: Sequelize.STRING(120)
    }, 
    reset_token:{
        type: Sequelize.TEXT
    }, 
    reset_expiry_date:{
        type: Sequelize.DATE
    }, 
    category_id:{
        type: Sequelize.INTEGER(11)
    }, 
    business_id:{
        type: Sequelize.INTEGER(11)
    }, 
    department_id:{
        type: Sequelize.INTEGER(11)
    }, 
    lga_id:{
        type: Sequelize.INTEGER(11)
    }, 
    lga_id:{
        type: Sequelize.INTEGER(11)
    }, 
    tax_office_id:{
        type: Sequelize.STRING
    }, 
},{
    freezeTableName: true,
    timestamps: false
});

module.exports = Users