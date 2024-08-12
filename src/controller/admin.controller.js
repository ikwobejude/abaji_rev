const User = require("../classes/user.service")

const user = new User();

module.exports = {
    adminDashboard: async function(req, res) {
        res.status(200).render('./dashboard')
    },

    getAllUsers: async function(req, res) {

    },

    // User group
    getUserGroup: async function(req, res) {
        const response = await user.userGroup()
        res.status(200).render('', {response})
    }
}