const adminService = require('../classes/admin.service')
const buildingService = require('../classes/building.service')
const businessService = require('../classes/business.service')

class enumerationController {
    static async panel(req, res) {
        const response = await adminService.revenuePanel(req.user)
        console.log(response)
        res.status(200).render('./enumeration/panel', response)
    }

    static async buildings(req, res) {
        try {
            const response = await buildingService.getAllBuildings({service_id:req.user.service_id, ...req.query})
            // console.log({response})
            res.status(200).render('./enumeration/enumerated_buildings', response)
        } catch (error) {
            console.log(error)
        }
    }

    static async businesses(req, res) {
        const response = await businessService.getAllBusiness({service_id: req.user.service_id, ...req.query})
        res.status(200).render('./enumeration/enumerated_business', response)
    }


    // generate mandates

    static async generateMandate(req, res) {
        const response = await businessService.mandateMetaData({service_id: req.user.service_id, ...req.query})
        console.log(response)
        res.status(200).render('./enumeration/generate_mandate', response)
    }
}

module.exports = enumerationController