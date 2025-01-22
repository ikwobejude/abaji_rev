const { Sequelize } = require("sequelize");
const { building } = require("../model/Buildings");
const { businesses } = require("../model/business.model");
const Revenues_invoices = require("../model/Revenue_invoice");

class Admin {
    constructor(){}

    async dashboard() {
        return {}
    }


    async revenuePanel(query) {
        const [ numberOfBusiness, numberOfBuildings, businessAmount ] = await Promise.all([
            businesses.count({ where: { service_id: query.service_id }}),
            building.count({ where: { service_id: query.service_id }}),
            // Revenues_invoices.findAll({
            //     where: {
            //         service_id: query.service_id,
            //         year: new Date().getFullYear(),
            //         source: 'Buildings'
            //     },
            //     attributes: [
            //       'source',
            //       [Sequelize.fn('sum', Sequelize.col('amount')), 'total'],
            //       [Sequelize.fn('sum', Sequelize.col('amount_paid')), 'total_paid'],
            //     ],
            //     group: ['source'],
            //     raw: true
            // }),
            Revenues_invoices.findAll({
                where: {
                    service_id: query.service_id,
                    year: new Date().getFullYear(),
                    source: 'Business'
                },
                attributes: [
                  'source',
                  [Sequelize.fn('sum', Sequelize.col('amount')), 'total'],
                  [Sequelize.fn('sum', Sequelize.col('amount_paid')), 'total_paid'],
                ],
                group: ['source'],
                raw: true
            })
        ])
        
        return {
            numberOfBusiness,
            numberOfBuildings,
            // buildingAmounts: buildingAmounts[0],
            businessAmount: businessAmount[0]
        }
    }
}

module.exports = new Admin();