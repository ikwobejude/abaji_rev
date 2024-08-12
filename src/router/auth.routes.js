const express = require('express');
const app = require('../controller/app.controllers');
const auth = require('../controller/auth.controller');
const Router = express.Router();


Router.route('/login')
    .get(auth.signInPage)
    .post(auth.signIn)

Router.route('/logout')
    .get(auth.logout)


module.exports = Router