const client = require('../classes/client.service');
const helper = require('../helper/helper')

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
    },

    addClient: async function (req, res) {
        try {
            const response = await client.create({ ...req.body, ...req.file });
            res.status(201).json(response)
        } catch (error) {
            helper.deleteFile(req.file.path)
            console.log(error)
            res.status(400).json({
                status: false,
                message: error.message
            })
        }
    },
}