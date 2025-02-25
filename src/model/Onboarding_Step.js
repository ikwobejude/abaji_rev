const Sequelize = require('sequelize');
const db = require('../db/connection');

const OnboardingStep = db.define(
    "OnboardingStep",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        path_url: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        setup_name: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        step_no: {
            type: Sequelize.INTEGER,
            allowNull: false,
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = OnboardingStep;
