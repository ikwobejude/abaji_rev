const sequelize = require('sequelize')
const db = require('../db/connection')
const Revenue_upload = require("../model/Revenue_upload");
const Users = require("../model/Users");
const { getDayWeekMonth } = require('../helper/helper');

class Admin {
    constructor(){
        this.users = Users
        this.revenueUploads = Revenue_upload
        this.db = db
        this.year = new Date().getFullYear()
    }

    async adminDashboard(user) {
        const users = await this.users.count({ where: {service_id: user.service_id}});
        const expected = await this.revenueUploads.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('*')), "invoice_count"],
                [sequelize.fn('SUM', sequelize.col('grand_total')), "grand_total"]
            ],
            where: {
                service_id: user.service_id,
                rate_year: user.year || new Date().getFullYear()
            },
            raw: true
        })

        console.log(expected)
        return {
            users,expected: expected[0], rate_year: user.year || new Date().getFullYear()
        }
    }

    async revenueGraph(user) {
        // const users = await this.users.count({ where: {service_id: user.service_id}});
        return await this.revenueUploads.findAll({
            attributes: [
                [sequelize.fn('MAX', sequelize.col('revenue_code')), "revenue_name"],
                [sequelize.fn('COUNT', sequelize.col('*')), "invoice_count"]
                // [sequelize.fn('SUM', sequelize.col('grand_total')), "grand_total"]
            ],
            where: {
                service_id: user.service_id,
                rate_year: new Date().getFullYear()
            },
            group: ['revenue_code'],
            raw: true
        })

        // console.log(expected)
        // return {
        //     expected
        // }
    }

    async streetExpectedGraph(query) {
        let sql = `
        SELECT 
            sum(r.grand_total) AS amount,
             MAX(s.street) AS label 
        FROM revenue_upload AS r
        INNER JOIN _streets AS s ON s.idstreet = r.street OR s.street = r.street
        WHERE r.service_id = :serviceId AND rate_year = :year
        GROUP BY s.street`;

        const data = await this.db.query(sql, {
            replacements: {
                serviceId: query.service_id,
                year: query.year || this.year
            },
            type: sequelize.QueryTypes.SELECT
        })

        return data
    }

    async streetPaymentGraph(query) {
        let sql = `
        SELECT 
            sum(r.amount_paid) AS amount,
            MAX(s.street) AS label 
        FROM revenue_upload AS r
        INNER JOIN _streets AS s ON s.idstreet = r.street OR s.street = r.street
        WHERE r.service_id = :serviceId AND r.payment_status = 1 AND rate_year = :year GROUP BY s.street`;

        const data = await this.db.query(sql, {
            replacements: {
                serviceId: query.service_id,
                year: query.year || this.year
            },
            type: sequelize.QueryTypes.SELECT
        })
        return data
    }

    async walletPayment(query) {
        let sql = `
        SELECT 
            MAX(r.description) AS label,
            sum(r.amount_paid) AS amount
        FROM revenue_invoices AS r
        WHERE r.service_id = :serviceId AND r.year = :year
        GROUP BY r.description`;

        const data = await this.db.query(sql, {
            replacements: {
                serviceId: query.service_id,
                year: query.year || this.year
            },
            type: sequelize.QueryTypes.SELECT
        })
        return data
    }
    
}

module.exports = Admin;