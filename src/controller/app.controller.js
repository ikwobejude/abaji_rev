const client = require('../classes/client.service');
const pay = require('../lib/pay_demo.payment');
const paymentService = require('../classes/payment.service');
const helper = require('../helper/helper')

const payment_service = new paymentService()

module.exports = {
    homePage: async function(req, res) {
        res.status(200).json({
            status: true,
            message: "success"
        })
    },

    // success login 
    loginSuccess: async function(req, res) {
        console.log(req.user.group_id)
        if(req.user.group_id == 111111 || req.user.group_id == 222222){
            res.redirect('/admin/dashboard')
        } 

        if(req.user.group_id === 111) {
            console.log(req.user.group_id)
            res.redirect('/super/super_dashboard')
        }
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
        
    },

    demoPayNotification: async(req, res) => {
        try {
            const response = await payment_service.settleIntoVariousRevenues(req.query)
            res.status(200).json(response)
        } catch (error) {
            res.status(400).json({
                status: true,
                message: error.message
            })
        }
    }
}