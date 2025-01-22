const express = require("express");
const admin = require("../controller/admin.controller");
const revenue = require("../controller/revenue.controller");
const adminController = require("../controller/admin.controller");
const enumerationController = require("../controller/enumeration.controller");
const wallet = require("../controller/wallet.controller");
const permission = require("../controller/permission.controller");
const Router = express.Router();

Router.route("/dashboard")
.get(admin.adminDashboard)
.put(admin.updateClientDetails);
// Router.put("/dashboard", );
Router.get('/payment/street_graph', admin.paymentsStreet)
Router.get('/generated_mandate/:status', admin.revenueGenerated)
Router.get('/revenue/street_graph', admin.revenueTaxOffice)
Router.get('/wallet_payment', admin.walletPayment)


Router.route("/revenue_upload")
.get(revenue.getRevenueItemByYear)
.post(revenue.createAssessments)
// .put(revenue.deleteYearly)
.delete(revenue.deleteYearly);

Router.get("/generate_budpay_pay_code", revenue.generatePayCode)

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
Router.route("/add_permission").post(revenue.addPermissionsToUser)
Router.route("/user_group")
.get(revenue.getUserRoles)
.post(revenue.postUserRoles)
.put(revenue.editUserRole)
.delete(revenue.deleteUserRole);
Router.delete("/user/:userId", revenue.deleteUser);
Router.put("/user/:userId", revenue.updateUser);
Router.route("/profile").get(adminController.getProfile);
Router.route("/security").get(adminController.security);


Router.get('/revenue_uploads', admin.getRevenueUGraph);

Router.route('/payment_reconciliation')
.get(revenue.uploadPaymentBatch)
.post(revenue.uploadPayment)

Router.route('/ticket_payment/:batch')
.get(revenue.uploadPaymentRec)
.delete(revenue.uploadPaymentDel)

Router.route('/permission')
.get(permission.permission)
.post(permission.new_permission)
.put(permission.edit_permission)
.delete(permission.delete_permission)
// Router.get('/get_permissions', permission.get_permissions)



// Enumerate revenue
Router.get('/enumerated_panel', enumerationController.panel)
Router.route('/enumerated_buildings')
.get(enumerationController.buildings)
Router.route('/enumerated_business')
.get(enumerationController.businesses)


Router.get('/enumerated_buildings/view', enumerationController.getBuilding)
Router.get('/enumerated_business/view/:profile_id/:building_id', enumerationController.getBusiness)

// Generate mandate
Router.route('/generate_mandate')
.get(enumerationController.generateMandate)
.post(enumerationController.processMandate)

Router.get('/enumerated_demand_notice/:year/:invoice_number', enumerationController.printDemandNotice)


Router.get('/all_users', admin.allUsers)



module.exports = Router;
