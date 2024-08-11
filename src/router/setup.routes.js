const express = require('express');
const setup = require('../controller/setup.controller');
const Router = express.Router();

Router.route('/ticket_item')
.get(setup.getTicketItem)
.post(setup.postTicketItem)

module.exports = Router