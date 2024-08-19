const express = require('express');
const reports = require('../controller/reports.controller');
const Router = express.Router();

Router.route('/payment_reports')
.get(reports.paymentsReports)

module.exports = Router