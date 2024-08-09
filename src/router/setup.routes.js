const express = require('express');
const setup = require('../controller/setup.controller');
const Router = express.Router();

Router.route('/ticket_item')
.get(setup.getTicketItem)

module.exports = Router