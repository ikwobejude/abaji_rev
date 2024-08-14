const sequelize = require('sequelize')
const Revenue_upload = require("../model/Revenue_upload");
const Users = require("../model/Users");

class Admin {
    constructor(){
        this.users = Users
        this.revenuUploads = Revenue_upload
    }

    async adminDashboard(user) {
        const users = await this.users.count({ where: {service_id: user.service_id}});
        const expected = await this.revenuUploads.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('*')), "invoice_count"],
                [sequelize.fn('SUM', sequelize.col('grand_total')), "grand_total"]
            ],
            where: {
                service_id: user.service_id,
                rate_year: new Date().getFullYear()
            },
            raw: true
        })

        console.log(expected)
        return {
            users,expected: expected[0]
        }
    }

    async revenueGraph(user) {
        // const users = await this.users.count({ where: {service_id: user.service_id}});
        return await this.revenuUploads.findAll({
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
}

module.exports = Admin;