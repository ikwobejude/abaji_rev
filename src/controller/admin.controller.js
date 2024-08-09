module.exports = {
    adminDashboard: async function(req, res) {
        // new Admin()
        res.status(200).render('./dashboard')
    }
}