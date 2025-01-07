const express = require('express');
const middleware = require('../middleware/middleware');
const apiController = require('../controller/api.controller');
const authController = require('../controller/auth.controller');
const { interSwitchControllers } = require('../controller/interswitch.controller');


const router = express.Router();


router.post('/login', authController.mobileLogin);

router.route('/reset_password')
.post(middleware.mobileMiddleware, apiController.apiResetPassword);


router.route('/generate')
.get(middleware.mobileMiddleware, apiController.ticketsBatch)
.post(middleware.mobileMiddleware, apiController.initGenerateTicketMandate)

router.route('/ticket/view_generated_ticket_batch/:batch')
.get(middleware.mobileMiddleware, apiController.getAllTickets)

router.route('/ticket/view_ticket/:id')
.get(middleware.mobileMiddleware, apiController.getTicket)

router.get('/wallet_balance', middleware.mobileMiddleware, apiController.walletBalance )
router.get('/ticket_types', middleware.mobileMiddleware, apiController.TicketType)
// inter-switch collection endpoint
router.post('/inter/switch/collection_service/:service_id', interSwitchControllers)

// Building meta data
router.get('/building_categories', middleware.mobileMiddleware, apiController.buildingCategories);
router.get('/building_type', middleware.mobileMiddleware, apiController.buildingTypes);

// location
router.get('/state', middleware.mobileMiddleware, apiController.state)
router.get('/lga/:state_id', middleware.mobileMiddleware, apiController.lga)
// router.get('/area/:lga',  middleware.mobileMiddleware, api.settings.fetchArea)
// router.get('/streets/:area',  middleware.mobileMiddleware, api.settings.streets)

// Business meta data 
router.get('/business_categories', middleware.mobileMiddleware, apiController.businessCategories);
router.get('/business_operation', middleware.mobileMiddleware, apiController.businessOpera);
router.get('/business_type', middleware.mobileMiddleware, apiController.businessTypes);
router.get('/business_sizes', middleware.mobileMiddleware, apiController.businessSize);
router.get('/business_sector', middleware.mobileMiddleware, apiController.businessSector);

router.post('/buildings', middleware.mobileMiddleware, apiController.createBuildings);
router.post('/business', middleware.mobileMiddleware, apiController.createBusinesses);





module.exports= router