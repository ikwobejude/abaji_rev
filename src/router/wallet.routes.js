const express = require("express");
const wallet = require("../controller/wallet.controller");
const Router = express.Router();

Router.route('/')
.get(wallet.walletTransactions)
.post(wallet.creditWallet)

Router.get('/validate_email', wallet.validateUser)
Router.get('/records', wallet.viewWallets)
Router.get('/transactions/:id', wallet.viewWalletTransactions)
// Router.post('/make_payment')

// Router

module.exports = Router;