const express = require("express");
const Router = express.Router();

const taxPayer = require("../controller/tax_payer.controller");

Router.route("/payers").get(taxPayer.taxPayers).post(taxPayer.createTaxPayer);

module.exports = Router;
