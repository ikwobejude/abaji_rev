const FundWallet = require("../classes/fund_wallet.service");
const User = require("../classes/user.service");
const Wallet = require("../classes/wallet.service");
const { walletToitValidation } = require("../lib/input_validation");

const user = new User();
const fund_wallet = new FundWallet()
const wallet = new Wallet()

module.exports = {
    creditWallet: async function(req, res) {
        // console.log(req.body)
        // return
        try {
            const {value, error} = walletToitValidation.validate(req.body)
            if(error) {
                throw Error(error.message)
            } else {
                
                const data = await fund_wallet.creditWallet(value, req.user);
                res.status(200).json(data)
            }
        } catch (error) {
            console.log(error)
            res.status(200).json({
                status: false,
                message: error.message
            })
        }
    },


    walletTransactions: async function(req, res) {
        const data = await fund_wallet.wallets(req.user.service_id);
        res.status(200).render('./wallet/wallet', {data})
    },

    validateUser: async function(req, res) {
        try {
            const data = await user.validateUserEmail(req.query.email, req.user.service_id);
            // console.log(data)
            res.status(200).json(data)
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: true,
                message: error.message
            })
        }
    },

    viewWallets: async function(req, res) {
        const data = await fund_wallet.wallets();
        // console.log(data)
        res.status(200).json(data)
    },

    viewWalletTransactions: async function(req, res) {
        const data = await fund_wallet.userWalletTransaction({...req.query, id: req.params.id});
        // console.log(data)
        res.status(200).render('./wallet/user_wallet_transactions', {...data})
    },

    makeAssessmentPayment: async function(req, res) {
        try {
            const request = await wallet.makeWalletAssessmentPayment({...req.body, ...req.params, ...req.user})
            console.log(request)
            res.status(200).json(request)
        } catch (error) {
            console.log(error)
            res.status(200).json({
                status: false,
                message: error.message
            })
            
        }
    }
}