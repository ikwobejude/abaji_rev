const client = require('../classes/client.service');
const pay = require('../lib/pay_demo.payment');
const helper = require('../helper/helper')

module.exports = {
    homePage: async function(req, res) {
        res.status(200).json({
            status: true,
            message: "success"
        })
    },

    // success login 
    loginSuccess: async function(req, res) {
        if(req.user.group_id == 111111 || req.user.group_id == 222222) res.redirect('/admin/dashboard')
    },

    addClient: async function (req, res) {
        try {
            const response = await client.create({ ...req.body, ...req.file });
            res.status(201).json(response)
        } catch (error) {
            helper.deleteFile(req.file.path)
            console.log(error)
            res.status(400).json({
                status: false,
                message: error.message
            })
        }
    },

    pushPayment: async (req, res) => {
        console.log(req.body)
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const payload = {
            payer_email: process.env.MAIL_FROM_ADDRESS,
            amount: parseFloat(req.body.amount_paid, 10),
            callback_url: baseUrl,
            invoice: req.body.bill_ref_no,
        }
        const response = await pay.initialize(payload)
        console.log(response)
        res.status(200).json(response)
        
    }
}