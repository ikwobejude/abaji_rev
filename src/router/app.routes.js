const express = require('express');
const app = require('../controller/app.controllers');
const Router = express.Router();


Router.route('/')
.get(app.homePage)

module.exports = Router