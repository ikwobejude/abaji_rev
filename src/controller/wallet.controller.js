const FundWallet = require("../classes/fund_wallet.service");
const User = require("../classes/user.service");
const Wallet = require("../classes/wallet.service");
const { walletToitValidation } = require("../lib/input_validation");

const user = new User();
const fund_wallet = new FundWallet()
const wallet = new Wallet()

class WalletController {
    static async creditWallet(req, res) {
        try {
            const { value, error } = walletToitValidation.validate(req.body);
            if (error) {
                throw new Error(error.message);
            } else {
                const data = await fund_wallet.creditWallet(value, req.user);
                res.status(200).json(data);
            }
        } catch (error) {
            console.error(error);
            res.status(200).json({
                status: false,
                message: error.message,
            });
        }
    }

    static async walletTransactions(req, res) {
        try {
            const data = await fund_wallet.wallets(req.user.service_id);
            res.status(200).render('./wallet/wallet', { data });
        } catch (error) {
            console.error(error);
            res.status(400).json({
                status: false,
                message: error.message,
            });
        }
    }

    static async validateUser(req, res) {
        try {
            const data = await user.validateUserEmail(req.query.email, req.user.service_id);
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(400).json({
                status: false,
                message: error.message,
            });
        }
    }

    static async viewWallets(req, res) {
        try {
            const data = await fund_wallet.wallets();
            res.status(200).json(data);
        } catch (error) {
            console.error(error);
            res.status(400).json({
                status: false,
                message: error.message,
            });
        }
    }

    static async viewWalletTransactions(req, res) {
        try {
            const data = await fund_wallet.userWalletTransaction({ ...req.query, id: req.params.id });
            res.status(200).render('./wallet/user_wallet_transactions', { ...data });
        } catch (error) {
            console.error(error);
            res.status(400).json({
                status: false,
                message: error.message,
            });
        }
    }

    static async makeAssessmentPayment(req, res) {
        try {
            const request = await wallet.makeWalletAssessmentPayment({
                ...req.body,
                ...req.params,
                ...req.user,
            });
            res.status(200).json(request);
        } catch (error) {
            console.error(error);
            res.status(200).json({
                status: false,
                message: error.message,
            });
        }
    }
}

module.exports = WalletController;
