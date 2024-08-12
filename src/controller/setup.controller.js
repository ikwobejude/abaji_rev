const Setup = require("../classes/setup.service")

const setup = new Setup();
module.exports = {
    getTicketItem: async function(req, res) {
        const response = await setup.Items(req.query)
        res.status(200).render('./setup/items/ticket_revenue_item_setup', {...response})
    },

    postTicketItem: async function(req, res) {
        try {
           const response = await setup.addItem(req.body, req.user.service_id) 
           res.status(201).json(response)
        } catch (error) {
            console.error(error)
            res.status(400).json({
                status: false,
                message: error.message
            })
        }
    },

    getState: async function(req, res) {
        const response = await setup.state(req.query)
        res.status(200).render('./setup/location/state', {response})
    },


    getLga: async function(req, res) {
        const response = await setup.Items(req.query)
        res.status(200).render('./setup/location/lga', {response})
    },

    getWard: async function(req, res) {
        const response = await setup.ward(req.query)
        res.status(200).render('./setup/location/ward', {...response})
    },

    postWard: async function(req, res) {
        try {
            console.log(req.body)
            const response = await setup.createWard(req.body, req.user.service_id) 
            res.status(201).json(response)
         } catch (error) {
             console.error(error)
             res.status(400).json({
                 status: false,
                 message: error.message
             })
         }
    },

    getStreets: async function(req, res) {
        const response = await setup.AllStreets(req.query)
        res.status(200).render('./setup/location/street', {...response})
    },

    postStreet: async function(req, res) {
        try {
            console.log(req.body)
            const response = await setup.createStreet(req.body, req.user.service_id) 
            res.status(201).json(response)
         } catch (error) {
             console.error(error)
             res.status(400).json({
                 status: false,
                 message: error.message
             })
         }
    },

}