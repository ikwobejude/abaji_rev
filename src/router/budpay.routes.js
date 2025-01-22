const express = require("express");
const Router = express.Router();
const budpay = require("../controller/budpay.controller");

Router.route("/budpay").post(budpay.standardCheckout);
Router.route("/budpay/create").post(budpay.createInvoice);
Router.route("/budpay/:invoiceNumber").post(budpay.callback);
Router.route("/webhook").post(budpay.webhook);

module.exports = Router;
    