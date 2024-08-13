const express = require("express");
const admin = require("../controller/admin.controller");
const revenue = require("../controller/revenue.controller");
const adminController = require("../controller/admin.controller");
const Router = express.Router();

Router.get("/dashboard", admin.adminDashboard);

Router.route("/revenue_upload")
  .get(revenue.getRevenueItemByYear)
  .post(revenue.createAssessments);

Router.get("/revenue_upload/view/:year", revenue.viewAssessmentInvoice);

Router.get("/demand_notice/:year/:invoice", revenue.demandNotice);
Router.route("/wallet_balance")
  .get(revenue.getWalletBalance)
  .post(revenue.getWalletBalance);

Router.route("/user").get(revenue.getUser).post(revenue.postUser);

Router.route("/user_group")
  .get(revenue.getUserRoles)
  .post(revenue.postUserRoles);
Router.delete("/user/:userId", revenue.deleteUser);
Router.put("/user/:userId", revenue.updateUser);
Router.route("/profile").get(adminController.getprofile);
Router.route("/security").get(adminController.security);

module.exports = Router;
