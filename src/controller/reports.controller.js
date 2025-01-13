const Reports = require("../classes/reports.service");

const reports = new Reports();

module.exports = {
  paymentsReports: async function (req, res) {
    const response = await reports.paymentReport(req.query);
    // res.status(200).json({...response})
    res.status(200).render("./report/payment_report", { ...response });
  },

  assessmentsReports: async function (req, res) {
    try {
      const response = await reports.assessmentReports({
        ...req.query,
        service_id: req.user.service_id,
      });
      // res.status(200).json(response)
      res.status(200).render("./report/assessments_report", { ...response });
    } catch (error) {
      console.error(error);
    }
  },
  ticketReports: async function (req, res) {
    try {
      const response = await reports.ticketReport(req.query);
        // console.log(response)
      res.status(200).render("./report/ticket_report", { ...response });
    } catch (error) {
      console.error(error);
    }
  },
};
