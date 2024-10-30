const express = require("express");
const reports = require("../controller/reports.controller");
const Router = express.Router();

Router.route("/payment_reports").get(reports.paymentsReports);

Router.get("/revenue_assessments_reports", reports.assessmentsReports);
Router.get("/ticket_report", reports.ticketReports);

module.exports = Router;
