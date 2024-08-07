const Ticketing = require("../classes/ticket.service")
const { validateTickets } = require("../lib/input_validation")
const Ticket = new Ticketing()

module.exports = {
    apiResetPassword: async function(req, res) {
        
    },

    ticketsBatch: async function (req, res) {
        // console.log(req.mobileUser.id)
        const response = await Ticket.findByBatch(req.user.id)
        
        res.status(200).json({
            response,
            // rate_year: helper.currentYear
        })
    },
    
    getAllTickets: async function(req, res) {
        
        const response =  await Ticket.findALLTickets(req.params.batch, req.user.id)
        res.status(200).json({
            response,
            // rate_year: helper.currentYear
        })
    },

    initGenerateTicketMandate: async function(req, res) {
        try {
            const {value, error} = validateTickets.validate(req.body) 
            // console.log(value)
            // return 

            if(error) {
                throw Error(error.message)
            } else {
                const Tickets = await Ticket.createTickets({...value, ...req.user});
                res.status(201).json(Tickets)
            }
        } catch (error) {
            console.log(error)
            res.status(400).json({
                status: false,
                message: error.message
            })
        }
    },

    getTicket: async function(req, res) {
        const response = await Ticket.findById(req.params.id)
        // console.log(response)
        if (response) {
            res.render('./ticketing/view_ticket', {
                page_title: 'View Ticket',
                response,
                user: req.user
            })
        } else {
            res.render('./ticketing/view_ticket_404', {
                ticket_id: req.params.id
            })
        }
    },
    

    TicketType: async function(req, res) {
        try{
            console.log("ticket_type")
            const data = await Ticket.getTicketTypes()
            res.status(200).json({
                status: true,
                data
            })
        } catch(error) {
    
            res.status(500).json({
                status: false,
                message: error.message
            })
        }
        
    }

    
}