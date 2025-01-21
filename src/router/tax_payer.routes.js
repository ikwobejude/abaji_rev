const express = require("express");
const Router = express.Router();

const taxPayer = require("../controller/tax_payer.controller");

Router.route("/payers").get(taxPayer.taxPayers).post(taxPayer.createTaxPayer);
Router.route("/tcc")
.get(taxPayer.getTCCRequest)
.post(taxPayer.generateTCC);
module.exports = Router;
