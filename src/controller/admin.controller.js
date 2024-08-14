const User = require("../classes/user.service");

const user = new User();

module.exports = {
  adminDashboard: async function (req, res) {
    res.status(200).render("./dashboard");
  },

  getAllUsers: async function (req, res) {},

  // User group
  getprofile: async function (req, res) {
    res.status(200).render("profile");
  },

  security: async function (req, res) {
    res.status(200).render("security");
  },
};
