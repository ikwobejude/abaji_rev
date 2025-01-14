const Reports = require("../classes/reports.service");

class ReportsController {
  static async paymentsReports(req, res) {
    try {
      const reports = new Reports();
      const response = await reports.paymentReport({
        service_id: req.user.service_id,
        ...req.query,
      });
      res.status(200).render("./report/payment_report", { ...response });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  }

  static async assessmentsReports(req, res) {
    try {
      const reports = new Reports();
      const response = await reports.assessmentReports({
        ...req.query,
        service_id: req.user.service_id,
      });
      res.status(200).render("./report/assessments_report", { ...response });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  }

  static async enumeratedReports(req, res) {
    try {
      const reports = new Reports();
      const response = await reports.revenueInvoicesReport({
        ...req.query,
        service_id: req.user.service_id,
      });
      res
        .status(200)
        .render("./report/revenue_enumeration_report", { ...response });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  }

  static async ticketReports(req, res) {
    try {
      const reports = new Reports();
      const response = await reports.ticketReport({
        service_id: req.user.service_id,
        ...req.query,
      });
      res.status(200).render("./report/ticket_report", { ...response });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred.");
    }
  }
}

module.exports = ReportsController;

