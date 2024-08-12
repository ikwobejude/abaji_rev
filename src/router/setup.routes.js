const express = require('express');
const setup = require('../controller/setup.controller');
const Router = express.Router();

Router.route('/ticket_item')
.get(setup.getTicketItem)
.post(setup.postTicketItem)

Router.get('/state', setup.getState)

Router.route('/ward')
.get(setup.getWard)
.post(setup.postWard)

Router.route('/street')
.get(setup.getStreets)
.post(setup.postStreet)

module.exports = Router