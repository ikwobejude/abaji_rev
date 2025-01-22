const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const building_categories = sequelize.define('_building_categories',{
    idbuilding_category:{
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    building_category:{ type: DataTypes.STRING }
},{
    timestamps : false,
    freezeTableName: true,
});


const building_types = sequelize.define('_building_types',{
    idbuilding_types:{
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    building_type:{ type: DataTypes.STRING },
    category:{ type: DataTypes.INTEGER }
},{
    timestamps : false,
    freezeTableName: true,
});

const building = sequelize.define('_buildings', {
    idbuilding:{
        type: DataTypes.INTEGER(20),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    building_number: DataTypes.STRING,
    tin: DataTypes.STRING,
    approval_code: DataTypes.STRING,
    building_name: DataTypes.STRING,
    building_image: DataTypes.BLOB,
    building_category_id: DataTypes.STRING,
    ward: DataTypes.INTEGER,
    lga: DataTypes.INTEGER,
    street_id: DataTypes.INTEGER,
    state_id: DataTypes.INTEGER,
    service_id: DataTypes.STRING,
    authorization_id: DataTypes.STRING,
    session_id: DataTypes.STRING,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    building_id: DataTypes.STRING,
    status: DataTypes.TINYINT,
    registered_by: DataTypes.STRING,
    registered_on: DataTypes.DATE,
    last_disabled_by: DataTypes.STRING,
    last_disabled_on: DataTypes.DATE,
    last_disable_reason: DataTypes.STRING,
    last_enabled_by: DataTypes.STRING,
    last_enabled_on: DataTypes.DATE,
    last_enable_reason: DataTypes.STRING,
    owner_name: DataTypes.STRING,
    owner_email: DataTypes.STRING,
    owner_mobile_no: DataTypes.STRING,
    apartment_type: DataTypes.STRING,
    apartment_count: DataTypes.INTEGER,
    property_id: DataTypes.STRING,
    no_of_apartments: DataTypes.STRING,
    sync: DataTypes.TINYINT,
    tax_office_id: DataTypes.STRING,
    image_id: DataTypes.STRING,
    building_tag: DataTypes.STRING,
    file_sync:DataTypes.TINYINT,
    item_codes: DataTypes.STRING,
},{
    timestamps : false,
    freezeTableName: true,
});

module.exports = {
    building_categories,
    building_types,
    building
};