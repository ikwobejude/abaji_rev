const Sequelize = require('sequelize');
const db = require('../../configs/db');


const Client_service = db.define('client_service', {
    id_services:{
        type: Sequelize.INTEGER(20),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    service_name:{
        type: Sequelize.STRING(255)
    },
    organization_name:{
        type: Sequelize.STRING(255)
    },
    organization_id:{
        type: Sequelize.STRING(150)
    },
    service_id:{
        type: Sequelize.STRING(150)
    },
    country_code:{
        type: Sequelize.STRING(45)
    },
    service_code:{
        type: Sequelize.STRING(4)
    },
    client_address:{
        type: Sequelize.STRING(255)
    },
    client_email:{
        type: Sequelize.STRING(45)
    },
    client_contact_person:{
        type: Sequelize.STRING(45)
    },
    client_admin:{
        type: Sequelize.STRING(50) 
    },
    client_admin_email:{
        type: Sequelize.STRING(50)
    },
    client_admin_pwd:{
        type: Sequelize.STRING(200)
    },
    client_admin_token:{
        type: Sequelize.STRING(55)
    },
    client_supervisor:{
        type: Sequelize.STRING(100) 
    },
    client_supervisor_email:{
        type: Sequelize.STRING(255)
    },
    client_supervisor_pwd:{
        type: Sequelize.STRING(200)
    },
    client_supervisor_token:{
        type: Sequelize.STRING(255)
    },
    isw_web_merchant_code:{
        type: Sequelize.STRING(55) 
    },
    isw_merchant_ref:{
        type: Sequelize.STRING(255)
    },
    isw_pos_merchant_code:{
        type: Sequelize.STRING(55)
    },
    isw_pos_merchant_ref:{
        type: Sequelize.STRING(255)
    },
    isw_ip_address:{
        type: Sequelize.STRING(55) 
    },
    service_logo_url:{
        type: Sequelize.STRING(100)
    },
    setup_by:{
        type: Sequelize.STRING(45)
    },
    setup_on:{
        type: Sequelize.DATE
    },
    last_modified_by:{
        type: Sequelize.STRING(45)
    },
    last_modified_on:{
        type: Sequelize.DATE
    },
    service_status:{
        type: Sequelize.TINYINT(1),
        allowNull: true
    },
    authorized:{
        type: Sequelize.TINYINT(1),
        allowNull: true
    },
    authorized_by:{
        type: Sequelize.STRING(45)
    },
    authorized_on:{
        type: Sequelize.DATE
    },
    activated_by:{
        type: Sequelize.STRING(45)
    },
    activated_on:{
        type: Sequelize.DATE
    },
    last_disabled_by:{
        type: Sequelize.STRING(55)
    },
    last_disabled_on:{
        type: Sequelize.DATE
    },
    last_reactivated_by:{
        type: Sequelize.STRING(55)
    },
    last_reactivated_on:{
        type: Sequelize.DATE
    },
    reason_for_last_disable:{
        type: Sequelize.STRING(255)
    },
    reason_for_last_reactivate:{
        type: Sequelize.STRING(255)
    },
    default_email_template:{
        type: Sequelize.TEXT(1)
    },
    admin_first_use:{
        type: Sequelize.TINYINT(1)
    },
    supervisor_first_use:{
        type: Sequelize.TINYINT(1)
    },
    session_id:{
        type: Sequelize.STRING(150)
    },
    registered_on:{
        type: Sequelize.DATE
    },
    country_id:{
        type: Sequelize.INTEGER(11)
    },
    state_id:{
        type: Sequelize.INTEGER(11)
    },
    state_code:{
        type: Sequelize.STRING(25)
    },
    client_type:{
        type: Sequelize.STRING(255)
    },
    client_supervisor_phone:{
        type: Sequelize.STRING(255)
    },
    client_admin_phone:{
        type: Sequelize.STRING(45)
    },
    admin_firstname:{
        type: Sequelize.STRING(50)
    },
    admin_middlename:{
        type: Sequelize.STRING(50)
    },
    admin_surname:{
        type: Sequelize.STRING(50)
    },
    supervisor_firstname:{
        type: Sequelize.STRING(50)
    },
    supervisor_middlename:{
        type: Sequelize.STRING(50)
    },
    supervisor_surname:{
        type: Sequelize.STRING(50)
    },
    created_by:{
        type: Sequelize.STRING(255)
    },
    created_at:{
        type: Sequelize.DATE
    },
    updated_by:{
        type: Sequelize.STRING(255)
    },
    updated_at:{
        type: Sequelize.DATE
    },
    organization_code:{
        type: Sequelize.STRING(10)
    },
    first_reminder_day:{
        type: Sequelize.INTEGER(2),
        allowNull: true
    },
    second_reminder_day:{
        type: Sequelize.INTEGER(2),
        allowNull: true
    },
    second_reminder_day:{
        type: Sequelize.INTEGER(2),
        allowNull: true
    },
    fourth_reminder_day:{
        type: Sequelize.INTEGER(2),
        allowNull: true
    },
    defaulter_reminder_day:{
        type: Sequelize.INTEGER(2),
        allowNull: true
    },
},{
    timestamps : false,
    freezeTableName: true,
});

module.exports = {
     Client_service
} 