const User = require("../classes/user.service");
const Wallet = require("../classes/wallet.service");


const response = new Wallet();
const user = new User();

module.exports = {
    fundWallet: async function(req, res) {
        // console.log(req.body)
        try {
            const {value, error} = Validation.walletToitValidation.validate(req.body)
            if(error) {
                throw Error(error.message)
            } else {
                
                const data = await response.creditWallet(value, req.user);
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
        // const data = await response.walletRecords(req.query, req.user);
        // res.status(200).json(data)
        res.status(200).render('./wallet/wallet', {
            // ...data
        })
    },

    validateUser: async function(req, res) {
        // const response = new systemUser();
        const data = await user.getUser(req.query.email);
        // res.status(200).json()
        if(data){
            res.status(200).json({
              status: "success",
              data: data
            })
          } else {
            res.status(401).json({
              status: "error",
              error: "User with the email address does not exist"
            })
          }
    }
}