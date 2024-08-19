const Reports = require("../classes/reports.service")

const reports = new Reports();

module.exports = {
    paymentsReports: async function(req, res) {
        const response = await reports.paymentReport(req.query)
        // res.status(200).json({...response})
        res.status(200).render('./report/payment_report', {...response})
    }
}