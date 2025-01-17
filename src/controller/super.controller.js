const superService = require('../classes/super.service')

class superAdmin {
    static async dashboard(req, res) {
        const response = await superService.dashboard()
        res.status(200).render('./super/dashboard', response)
    }
}

module.exports = superAdmin