module.exports = {
    getTicketItem: async function(req, res) {
        res.status(200).render('./setup/items/ticket_revenue_item_setup')
    } 
}