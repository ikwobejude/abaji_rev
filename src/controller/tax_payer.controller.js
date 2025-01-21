const taxpayer = require('../classes/taxpayer.service')
class TaxPayerController {
    static async createTaxPayer(req, res) {
        try {
            const response = await taxpayer.create({service_id: req.user.service_id, ...req.body})
            console.log(response)
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                status: false,
                message: error.message
            })
        }
    }

    static async taxPayers(req, res) {
        const response = await taxpayer.findAll({service_id: req.user.service_id, ...req.query})
        console.log(response)
        // res.status(201).json(response)
    }

    
}