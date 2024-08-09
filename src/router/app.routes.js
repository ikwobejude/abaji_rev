const express = require('express');
const app = require('../controller/app.controllers');
const middleware = require('../middleware/middleware');
const Router = express.Router();


Router.route('/')
.get(app.homePage)

Router.get('/success', middleware.requireAuth, app.loginSuccess)

module.exports = Router