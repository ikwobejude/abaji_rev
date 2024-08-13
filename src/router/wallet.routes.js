const express = require("express");
const wallet = require("../controller/wallet.controller");
const Router = express.Router();

Router.route('/')
.get(wallet.walletTransactions)
.post(wallet.fundWallet)

// Router.get('/validate_email', WalletController.validateUser)

// Router

module.exports = Router;