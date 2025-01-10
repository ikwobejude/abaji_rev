const { building } = require("../model/Buildings");
const { businesses } = require("../model/business.model");

class Admin {
    constructor(){}

    async dashboard() {
        return {}
    }


    async revenuePanel(query) {
        const numberOfBusiness = await businesses.count({ where: { service_id: query.service_id }});
        const numberOfBuildings = await building.count({ where: { service_id: query.service_id }});
        return {
            numberOfBusiness,
            numberOfBuildings
        }
    }
}

module.exports = new Admin();