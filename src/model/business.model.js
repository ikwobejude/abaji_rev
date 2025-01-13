const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const business_categories = sequelize.define('_business_categories',{
    business_category_id:{
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    business_category:{ type: DataTypes.STRING }
},{
    timestamps : false,
    freezeTableName: true,
});

const business_operations = sequelize.define('_business_operations',{
    business_operation_id:{
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    business_operation:{ type: DataTypes.STRING }
},{
    timestamps : false,
    freezeTableName: true,
});

const business_sectors = sequelize.define('_business_sectors',{
    business_sector_id:{
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    business_sector:{ type: DataTypes.STRING }
},{
    timestamps : false,
    freezeTableName: true,
});

const business_sizes = sequelize.define('_business_sizes',{
    business_size_id:{
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    business_size:{ type: DataTypes.STRING }
},{
    timestamps : false,
    freezeTableName: true,
});

const business_types = sequelize.define('_business_types',{
    idbusiness_type:{
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    business_type:{ type: DataTypes.STRING }
},{
    timestamps : false,
    freezeTableName: true,
});

const businesses = sequelize.define('businesses',{
    business_id:{
        type: DataTypes.BIGINT(20),
        autoIncrement: true,
        primaryKey: true,
        allowNull : true
    },
    id_business:{
        type: DataTypes.STRING(45)
    },
    business_rin:{
        type: DataTypes.STRING(255)
    },
    business_type:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    asset_type:{
        type: DataTypes.STRING(255),
        allowNull: true
    },
    business_name:{
        type: DataTypes.STRING(255)
    },
    business_lga:{
        type: DataTypes.STRING(45)
    },
    business_category:{
        type: DataTypes.STRING(50)
    },
    business_sector:{
        type: DataTypes.STRING(50)
    },
    business_sub_sector:{
        type: DataTypes.STRING(50)
    },
    business_structure:{
        type: DataTypes.STRING(50)
    },
    business_operation:{
        type: DataTypes.STRING(50)
    },
    Profile_ref:{
        type: DataTypes.STRING(100)
    },
    Status:{
        type: DataTypes.STRING(40),
        allowNull: true
    },
    service_id:{
        type: DataTypes.STRING(100),
        allowNull: true
    },
    created_at:{
        type: DataTypes.DATE
    },
    created_by: DataTypes.STRING,
    updated_by:{
        type: DataTypes.STRING
    },
    updated_at:{
        type: DataTypes.DATE
    },
    tax_id:{
        type: DataTypes.INTEGER(11)
    },
    taxpayer_rin:{
        type: DataTypes.STRING(50)
    },
    system_business_rin:{
        type: DataTypes.STRING
    },
    business_size:{
        type: DataTypes.STRING    
    },
    business_address:{
        type: DataTypes.TEXT
    },
    contact_person:{
        type: DataTypes.STRING
    },
    businessnumber:{
        type: DataTypes.STRING
    },
    business_email:{
        type: DataTypes.STRING(50)
    },
    passwordr:{
        type: DataTypes.STRING(100) 
    },
    photo_url:{
        type: DataTypes.TEXT
    },
    apartment_id:{
        type: DataTypes.STRING(110),
        allowNull: true   
    },
    building_id:{
        type: DataTypes.STRING  
    },
    organization_id:{
        type: DataTypes.STRING(110) 
    },
    tax_office_id:{
        type: DataTypes.INTEGER(11)
    },
    business_ownership:{
        type: DataTypes.STRING(50)
    },
    ward_id:{ type: DataTypes.INTEGER(11)  },
    business_street_id:{ type: DataTypes.INTEGER(11)  },
    business_tag:{
        type: DataTypes.STRING(255)
    },
    tax_item_codes: DataTypes.STRING,
    business_street: {type: DataTypes.STRING},
    sync: {type: DataTypes.TINYINT(1)}
},{
    timestamps : false,
    freezeTableName: true,
});

module.exports = {
    business_categories,
    business_operations,
    business_sectors,
    business_sizes,
    business_types,
    businesses
};