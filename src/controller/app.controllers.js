module.exports = {
    homePage: async function(req, res) {
        res.status(200).json({
            status: true,
            message: "success"
        })
    },

    // success login 
    loginSuccess: async function(req, res) {
        if(req.user.group_id == 111111 || req.user.group_id == 222222) res.redirect('/admin/dashboard')
    }
}