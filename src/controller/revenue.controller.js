const Revenue = require("../classes/revenue.service")

const revenue = new Revenue();
module.exports = {
    getRevenueItemByYear: async function(req, res) {
        const response = await revenue.revenueByYear(req.query);
        res.status(200).render('./revenue/cooperative/upload_records', {...response})
    },

    createAssessments: async function(req, res) {
        try {
            const response = await revenue.uploadCooperateBusinessData(req.body);
            res.status(200).json(response)
        } catch (error) {
            
        }
    },

    viewAssessmentInvoice: async function(req, res) {
        
        const response = await revenue.revenuesInvoices({year: req.params.year});
        res.status(200).render('./revenue/cooperative/revenue_invoice', {...response})
    }

}