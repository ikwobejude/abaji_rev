module.exports = {
    homePage: async function(req, res) {
        res.status(200).json({
            status: true,
            message: "success"
        })
    }
}