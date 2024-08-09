const express = require('express');
const admin = require('../controller/admin.controller');
const Router = express.Router()


Router.get('/dashboard', admin.adminDashboard)

module.exports = Router