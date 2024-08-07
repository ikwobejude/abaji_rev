'use strict';
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

// dotenv.config({path: './config.env'})


const DB = process.env.DATABASE
const USER =  process.env.NAME

// console.log(USER)
const PASSWORD = process.env.DB_PASSWORD
const HOST = process.env.DB_HOST
const DIALECT = 'mysql'
const PORT = 3306

const sequelize = new Sequelize(
    DB,
    USER,
    PASSWORD,
    {
        host: HOST,
        dialect: DIALECT,
        port: PORT,
        logging: false,
    }
)
module.exports = sequelize;