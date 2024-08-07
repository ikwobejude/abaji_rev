const express = require('express');
const middleware = require('../middleware/middleware');
const apiController = require('../controller/api.controller');


const router = express.Router();


router.route('/reset_password')
.post(middleware.mobileMiddleware, apiController.apiResetPassword);


router.route('/generate')
.get(middleware.mobileMiddleware, apiController.ticketsBatch)
.post(middleware.mobileMiddleware, apiController.initGenerateTicketMandate)

router.route('/ticket/view_generated_ticket_batch/:batch')
.get(middleware.mobileMiddleware, apiController.getAllTickets)



router.route('/ticket/view_ticket/:id')
.get(middleware.mobileMiddleware, apiController.getTicket)

// router.post('/make/wallet_payment', middleware.mobileMiddleware, apiController.makeBulkPayment)
// router.get('/wallet_balance', middleware.mobileMiddleware, apiController.walletBalance )

router.get('/ticket_types', middleware.mobileMiddleware, apiController.TicketType )


module.exports= router