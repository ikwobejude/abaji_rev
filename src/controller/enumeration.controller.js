const buildingService = require('../classes/building.service')
const businessService = require('../classes/business.service')

class enumerationController {
    static async buildings(req, res) {
        const response = await buildingService.getAllBuildings(req.query)
        res.status(200).json(response)
    }

    static async businesses(req, res) {
        const response = await businessService.getAllBusiness(req.query)
        res.status(200).json(response)
    }
}

module.exports = enumerationController