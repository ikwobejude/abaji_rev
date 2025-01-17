const express = require("express");
const Router = express.Router();

const controllers = require('../controller/super.controller')

Router.get('/super_dashboard', controllers.dashboard)

module.exports = Router;
