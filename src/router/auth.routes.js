const express = require("express");
const app = require("../controller/app.controller");
const auth = require("../controller/auth.controller");
const Router = express.Router();

Router.route("/login").get(auth.signInPage).post(auth.signIn);

Router.route("/logout").get(auth.logout);
Router.route("/change-password").put(auth.resetPassword);

module.exports = Router;
