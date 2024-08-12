const express = require('express');
const admin = require('../controller/admin.controller');
const revenue = require('../controller/revenue.controller');
const Router = express.Router()


Router.get('/dashboard', admin.adminDashboard)

Router.route("/revenue_upload")
.get(revenue.getRevenueItemByYear)
.post(revenue.createAssessments);

Router.get('/revenue_upload/view/:year', revenue.viewAssessmentInvoice)

Router.get('/demand_notice/:year/:invoice', revenue.demandNotice)
Router.get('/wallet_balance', revenue.getWalletBalance)

module.exports = Router