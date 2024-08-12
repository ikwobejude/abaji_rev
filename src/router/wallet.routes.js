const express = require("express");
const WalletController = require("../controllers/Users/WalletController");
const Router = express.Router();

Router.route('/')
.get(WalletController.walletTransactions)
.post(WalletController.fundWallet)

Router.get('/validate_email', WalletController.validateUser)

// Router

module.exports = Router;