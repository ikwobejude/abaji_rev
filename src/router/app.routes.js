const express = require('express');
const app = require('../controller/app.controllers');
const middleware = require('../middleware/middleware');
const Router = express.Router();


Router.route('/')
.get(function(req, res) {
    res.redirect("/login")
})
Router.get('/blank', function(req, res) {
    res.status(200).render('./blank')
})

Router.get('/success', middleware.requireAuth, app.loginSuccess)

module.exports = Router