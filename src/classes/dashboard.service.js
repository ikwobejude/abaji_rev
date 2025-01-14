const Sequelize = require('sequelize')
const db = require('../db/connection')
const Revenue_upload = require("../model/Revenue_upload");
const Users = require("../model/Users");
const { getDayWeekMonth } = require('../helper/helper');
const Revenues_invoices = require('../model/Revenue_invoice');

class Admin {
    constructor(){
        this.users = Users
        this.revenuUploads = Revenue_upload
        this.revenueInvoices = Revenues_invoices
        this.db = db
        this.year = new Date().getFullYear()
    }

    async adminDashboard(service_id) {
        try {
            console.log({ service_id });
    
            // Fetch user count
            const users = await this.users.count({ where: { service_id } });
    
            // Fetch revenue uploads and invoices concurrently
            const [expected, revExpectations] = await Promise.all([
                this.revenuUploads.findAll({
                    where: {
                        service_id,
                        rate_year: new Date().getFullYear(),
                    },
                    attributes: [
                        [Sequelize.fn('COUNT', Sequelize.col('*')), "invoice_count"],
                        [Sequelize.fn('SUM', Sequelize.col('grand_total')), "grand_total"],
                        [Sequelize.fn('SUM', Sequelize.col('amount_paid')), "amount_paid"],
                    ],
                    raw: true,
                }),
                this.revenueInvoices.findAll({
                    where: {
                        service_id,
                        year: new Date().getFullYear(),
                    },
                    attributes: [
                        [Sequelize.fn('COUNT', Sequelize.col('*')), "revenue_count"],
                        [Sequelize.fn('SUM', Sequelize.col('amount')), "grand_total"],
                        [Sequelize.fn('SUM', Sequelize.col('amount_paid')), "amount_paid"],
                    ],
                    raw: true,
                }),
            ]);
    
            // console.log({expected: expected[0], revExpectations: revExpectations[0]});
    
            // Return aggregated data
            return {
                users,
                expected: expected[0], // First result from `findAll`
                revExpectations: revExpectations[0], // First result from `findAll`
            };
        } catch (error) {
            console.error("Error in adminDashboard:", error);
            throw error; // Rethrow to handle upstream if necessary
        }
    }
    
    async revenueGraph(user) {
        // const users = await this.users.count({ where: {service_id: user.service_id}});
        return await this.revenuUploads.findAll({
            attributes: [
                [Sequelize.fn('MAX', Sequelize.col('revenue_code')), "revenue_name"],
                [Sequelize.fn('COUNT', Sequelize.col('*')), "invoice_count"]
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

    async streetExpectedGraph(service_id) {
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
                serviceId: service_id,
                year:  this.year
            },
            type: Sequelize.QueryTypes.SELECT
        })

        return data
    }

    async streetPaymentGraph(service_id) {
        let sql = `
        SELECT 
            sum(r.amount_paid) AS amount,
            MAX(s.street) AS label 
        FROM revenue_upload AS r
        INNER JOIN _streets AS s ON s.idstreet = r.street OR s.street = r.street
        WHERE r.service_id = :serviceId AND r.payment_status = 1 AND rate_year = :year GROUP BY s.street`;

        const data = await this.db.query(sql, {
            replacements: {
                serviceId: service_id,
                year:  this.year
            },
            type: Sequelize.QueryTypes.SELECT
        })
        return data
    }

    async walletPayment(service_id) {
        let sql = `
        SELECT 
             MAX(r.description) AS label,
            sum(r.amount_paid) AS amount
        FROM revenue_invoices AS r
        WHERE r.service_id = :serviceId
        GROUP BY r.description`;

        const data = await this.db.query(sql, {
            replacements: {
                serviceId: service_id
            },
            type: Sequelize.QueryTypes.SELECT
        })
        return data
    }
    
    async generatedEnumerationGraph(query) {
        console.log(query)
        const [data] = await Promise.all([
            Revenues_invoices.findAll({
                where: {
                    service_id: query.service_id,
                    year: new Date().getFullYear(),
                    paid: query.status
                },
                attributes: [
                    ['source', 'label'],
                  [Sequelize.fn('sum', Sequelize.col(`${query.status == 1 ? 'amount_paid': 'amount'}`)), 'amount'],
                ],
                group: ['source'],
                raw: true
            }),
        ])

        // console.log(data)

        return data
        
    }
}

module.exports = Admin;