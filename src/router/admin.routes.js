const express = require("express");
const admin = require("../controller/admin.controller");
const revenue = require("../controller/revenue.controller");
const adminController = require("../controller/admin.controller");
const wallet = require("../controller/wallet.controller");
const permission = require("../controller/permission.controller");
const Router = express.Router();

Router.get("/dashboard", admin.adminDashboard);

Router.route("/revenue_upload")
.get(revenue.getRevenueItemByYear)
.post(revenue.createAssessments)
// .put(revenue.deleteYearly)
.delete(revenue.deleteYearly);

Router.get("/generate_budpay_pay_code", revenue.generate_pay_code)

Router.route("/revenue_upload/view/:year")
.get(revenue.viewAssessmentInvoice);
Router.route("/revenue_upload/view/batch/:batch").get(
  revenue.viewBatchAssessmentInvoice
);

Router.route("/demand_notice/:year/:invoice")
.get(revenue.demandNotice)
.post(wallet.makeAssessmentPayment);

Router.post('/discount/:invoice', revenue.addDiscount)
Router.route("/wallet_balance").get(revenue.getWalletBalance).post(revenue.getWalletBalance);

Router.route("/user").get(revenue.getUser).post(revenue.postUser);

Router.route("/user_group")
.get(revenue.getUserRoles)
.post(revenue.postUserRoles)
.put(revenue.editUserRole)
.delete(revenue.deleteUserRole);
Router.delete("/user/:userId", revenue.deleteUser);
Router.put("/user/:userId", revenue.updateUser);
Router.route("/profile").get(adminController.getprofile);
Router.route("/security").get(adminController.security);


Router.get('/revenue_uploads', admin.getRevenueUGraph);

Router.route('/payment_reconciliation')
.get(revenue.upload_payment_batch)
.post(revenue.upload_payment)

Router.route('/ticket_payment/:batch')
.get(revenue.upload_payment_rec)
.delete(revenue.upload_payment_del)

Router.route('/permission')
.get(permission.permission)
.post(permission.new_permission)
.put(permission.edit_permission)
.delete(permission.delete_permission)


// Router.get('/get_permissions', permission.get_permissions)

module.exports = Router;
