const permission = require('../classes/permission.service')
module.exports = {
    permission: async function(req, res) {
        const response = await permission.retrieve();
        res.status(200).render('./users/permission', {...response})
    },

    // get_permissions: async function(req, res) {
        
    //     console.log(response)
    //     res.status(200).json(response)
    // },

    new_permission: async function(req, res) {
        console.log(req.body)
        try {
            const response = await permission.create(req.body);
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                status: false,
                message: error.message
            })
        }
    },

    edit_permission: async function(req, res) {
        console.log(req.body)
        try {
            const response = await permission.modify(req.body);
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                status: false,
                message: error.message
            })
        }
    },

    delete_permission: async function(req, res) {
        // console.log(req.body)
        try {
            const response = await permission.delete(req.query.id);
            res.status(201).json(response)
        } catch (error) {
            res.status(400).json({
                status: false,
                message: error.message
            })
        }
    }

    


}