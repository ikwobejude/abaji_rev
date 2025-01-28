const Admin = require("../classes/dashboard.service");
const User = require("../classes/user.service")

const user = new User();
const admin = new Admin()
module.exports = {
    adminDashboard: async function(req, res) {
        const data = await admin.adminDashboard({...req.user, ...req.query})
        res.status(200).render('./dashboard', {...data})
    },

    revenueStreet: async function(req, res) {
        const data = await admin.streetExpectedGraph({service_id: req.user.service_id, year: req.query.year})
        res.status(200).json(data)
    },

    paymentsStreet: async function(req, res) {
        const data = await admin.streetPaymentGraph({service_id: req.user.service_id, year: req.query.year})
        res.status(200).json(data)
    },

    walletPayment: async function(req, res) {
        const data = await admin.walletPayment({service_id: req.user.service_id, year: req.query.year})
        res.status(200).json(data)
    },

  getAllUsers: async function (req, res) {},

  // User group
  getprofile: async function (req, res) {
    res.status(200).render("profile");
  },

    // User group
    getUserGroup: async function(req, res) {
        const response = await user.userGroup()
        res.status(200).render('', {response})
    },

     // User group
     getRevenueUGraph: async function(req, res) {
        const response = await admin.revenueGraph(req.user)
        res.status(200).json(response)
    },
    security: async function (req, res) {
        res.status(200).render("security");
    },
};
