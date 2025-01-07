const Ticketing = require("../classes/ticket.service")
const Wallet = require("../classes/wallet.service")
const buildingService = require("../classes/building.service")
const businessService = require("../classes/business.service")
const { validateTickets } = require("../lib/input_validation")
const Ticket = new Ticketing()
const wallet = new Wallet()

class apiController {
    static async apiResetPassword() {}
    // ticket 
    static async ticketsBatch(req, res) {
        const response = await Ticket.findByBatch(req.user.id)
        
        res.status(200).json({
            response,
            // rate_year: helper.currentYear
        })
    }

    static async getAllTickets() {
        const response =  await Ticket.findALLTickets(req.params.batch, req.user.id)
        res.status(200).json({
            response,
            // rate_year: helper.currentYear
        })
    }

    static async initGenerateTicketMandate(req, res) {
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
    }

    static async getTicket(req, res) {
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
    }

    static async TicketType(req, res) {
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

    static async walletBalance(req, res) {
        try {
            const balance = await wallet.walletBalance(req.user.id)
           
            res.status(200).json(balance)
            
        } catch(error) {
            res.status(500).json({
                status: false,
                message: error.message
            })
        }
        
    }

    // Enumeration starts 
    // Buildings meta data controller
    static async buildingCategories(req, res) {
        const response = await buildingService._building_categories(req.query)
        res.status(200).json({ 
            status: true,
            data: response
        })
    }
    static async buildingTypes(req, res) {
        const response = await buildingService.allBuildingType(req.query)
        res.status(200).json({ 
            status: true,
            data: response 
        })
    }

    // Businesses meta data controller
    static async businessCategories(req, res) {
        const response = await businessService._business_categories(req.query)
        res.status(200).json({ status: true, data: response })
    }
    static async businessOpera(req, res) {
        const response = await businessService._business_operation(req.query)
        res.status(200).json({ status: true, data: response })
    }
    static async businessTypes(req, res) {
        const response = await businessService._business_type(req.query)
        res.status(200).json({ status: true, data: response })
        
    }
    static async businessSize(req, res) {
        const response = await businessService._business_sizes(req.query)
        res.status(200).json({ status: true, data: response })
    }
    static async businessSector(req, res) {
        const response = await businessService._business_sector(req.query)
        res.status(200).json({ status: true, data: response })
    }

    // sync buildings from mobile 
    static async createBuildings(req, res) {
        try {
            const result = await buildingService.createBuildings(req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            console.log({ error });
      
            res.status(400).json({
              status: false,
              message: error.message,
            });
        }
    }

    // sync business from mobile
    static async createBusinesses(req, res) {
        try {
            const result = await businessService.createBusiness(req.body, req.user);
            res.status(200).json(result);
        } catch (error) {
            console.log({ error });
        
            res.status(400).json({
                status: false,
                message: error.message,
            });
        }
    }

}
module.exports = apiController