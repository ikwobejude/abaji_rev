const Sequelize = require("sequelize");
const Tickets = require("../model/Ticket");
const Tax_offices = require("../model/Office");
const helper = require("../helper/helper");
// const wallet = require("../model/Wallet");
const Revenue_item = require("../model/Revenue_item");
const Users = require("../model/Users");
const Wallet = require("./wallet.service");
const Op = Sequelize.Op;

class Ticketing extends Wallet {
    constructor() {
        super()
        this.tickets = Tickets;
        this.office = Tax_offices;
        this.ticketType = Revenue_item;
        this.dmy = helper.getDayWeekMonth();
        this.users = Users;
        
    }
    // await Users
    async findALLTickets(batch, id) {
        // await tax_offices
        // console.log(batch, id)
        return await this.tickets.findAll({
            where: {
                batch,
                agent_id: id
            },
            raw: true,
        });
    }

    async getTicketTypes () {
        return await this.ticketType.findAll({
            attributes: [['itemID', 'id'], ['item_code', 'time_line'], ['revenue_item', 'TicketType'], 'amount'],
            where: {
                code: 11111111
            },
            raw:true
        })
    }

    async ticketByAgents(query) {
        const tickets = await this.tickets.findAll({
            attributes: [
                'agent_id', 'location', 'created_on', 'batch', 'agent_name', 'ticket_type', 'batch', 'office_id', [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
              ],
            where: {
                [Op.and]: [
                    query.service_id && { service_id: query.service_id },
                    query.userId && { agent_id: `${query.userId}` },
                    query.tax_office_id && {tax_office_id: query.tax_office_id},
                    query.assessment_no &&  { [Op.or]: [
                        {name_of_business: {[Op.like]: `%${query.assessment_no}%`}},
                        {bill_ref_no: {[Op.like]: `%${query.assessment_no}%`}},
                        {assessment_no: {[Op.like]: `%${query.assessment_no}%`}},
                    ]},
                  ],
            },
            group: ['agent_id'],
            raw: true,
        });

        const agents = await this.users.findAll({
            attributes: ['name', 'group_id', 'id'],
            where: {
                group_id: 55555
            },
            raw: true
        })

        return {
            tickets,
            agents
        }
    }


    async batchTicketByAgents(query) {
        // console.log(query)
        let perPage = 50; // number of records per page
        var page = query.page || 1;

        let offset = perPage * page - perPage;
        const tickets = await this.tickets.findAll({
            attributes: [
                'agent_id','location', 'created_on', 'batch', 'agent_name', 'ticket_type', 'batch',
                 [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
              ],
            where: {
                [Op.and]: [
                    query.service_id && { service_id: query.service_id },
                    query.id && { agent_id: `${query.id}` },
                    query.ticket_type && {ticket_type: query.ticket_type},
                    (query.from && query.to) && {
                        created_on: {
                          [Op.gte]: query.from,
                          [Op.lte]: query.to
                        }
                      },
                      (query.from && !query.to) && [
                        Sequelize.where(Sequelize.fn('date', Sequelize.col('created_on')), '=', query.from),
                      ],
                  ],
            },
            group: ['batch'],
            limit: perPage,
            offset: offset,
            raw: true,
        });

        const count = await this.tickets.count({
            where: {
                [Op.and]: [
                    query.service_id && { service_id: query.service_id },
                    query.id && { agent_id: `${query.id}` },
                    query.ticket_type && {ticket_type: query.ticket_type},
                    (query.from && query.to) && {
                        created_on: {
                          [Op.gte]: query.from,
                          [Op.lte]: query.to
                        }
                      },
                      (query.from && !query.to) && [
                        Sequelize.where(Sequelize.fn('date', Sequelize.col('created_on')), '=', query.from),
                      ],
                  ],
            },
            // group: ['batch'],
        })

        const ticketType = await this.getTicketTypes();

        return {
            uri: `id=${query.id}&ticket_type=${query.ticket_type}&from=${query.from}&to=${query.to}`,
            tickets,
            ticketType,
            current: page,
            pages: Math.ceil(count / perPage),
        }
    }

    async findByBatch(id) {
        return await this.tickets.findAll({
            attributes: [
                [Sequelize.fn('MAX', Sequelize.col('location')), 'location'],
                [Sequelize.fn('MAX', Sequelize.col('batch')), 'batch'],
                [Sequelize.fn('MAX', Sequelize.col('agent_name')), 'agent_name'],
                [Sequelize.fn('MAX', Sequelize.col('ticket_type')), 'ticket_type'],
                [Sequelize.fn('MAX', Sequelize.col('batch')), 'batch'],
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'count'],
              ],
            where: {
                agent_id: id
            },
            group: ['batch'],
            raw: true,
        });
    }

    async findById(id) {
        return await this.tickets.findOne({
            where: {
                id: id,
                // agent_id: aId
            },
            raw: true
        })
        
    }

    async createTickets(details) {
        // console.log(details, "hello")
        // return

        const office = await this.office.findOne({
            attributes: ['tax_office'],
            where: {
                tax_office_id: details.tax_office_id
            }, 
            raw:true
        })
        const ticketD = details.ticket_type.split('/')
        // console.log({ticketD})
        const i = details.number_of_ticket;
        const batch = new Date().getTime().toString(36).toLocaleUpperCase()
        const walletB = await this.walletBalance(details.id);
        console.log({walletB})
        // if(walletB.status == true) {}
        const gAmount = i * parseFloat(ticketD[1]);
        console.log({gAmount})
        if(walletB.status == false) return walletB
        if(parseFloat(gAmount).toFixed(2)  > parseFloat(walletB.balance)) return { status: false, message: "You don't have sufficient balance to perform this transaction" }
        const walletBalance = parseFloat(walletB.balance) - parseFloat(gAmount);
        // console.log({walletBalance, walletB})
        const payload = {
            id: details.id,
            amount: gAmount,
            idwallent: walletB.idwallent,
            bill_ref_no: batch,
            name: details.name,
            tdescription: ticketD[0]
        }

        console.log(payload)

        // console.log({gAmount, balance: walletB.balance})

        // console.log(walletB.status == true && Number(walletB.balance) > gAmount)
        
        if(walletB.status == true && Number(walletB.balance) > gAmount) {
            if(i > 0) {
                let arr = [];
                // let dmy = helper.getDayWeekMonth()
                for (let numb = 0; numb < i; numb++) {
                    let amount = parseFloat(ticketD[1]);
                    const element = {
                        agent_id: details.id,
                        agent_name: details.name,
                        ticket_type: ticketD[0],
                        location: details.category_id,
                        office_id: details.tax_office_id,
                        day: this.dmy.day,
                        month: this.dmy.month,
                        year: this.dmy.year,
                        reference_number: helper.randomNum(20),
                        amount: amount,
                        batch: batch,
                        payment_status: 1,
                        amount_paid: amount,
                        payment_date: new Date()
                    }
                    arr.push(element);
                }
    
                // console.log(arr)
                const t = await this.db.transaction();
                try {
                    await this.tickets.bulkCreate(arr, { transaction: t })
                    await this.walletHistory(payload, t);
                    await new this.walletTransaction(payload, t);
                    await this.wallet.update({balance: walletBalance}, {where: {
                        idwallent: walletB.walletId
                    }}, {raw: true}, { transaction: t })
                    await t.commit();
                    return {
                        status: true,
                        batch,
                        message: "Created Successfully"
                    }
                } catch (error) {
                    await t.rollback();
                    console.log(error)
                    return {
                        status: false,
                        message: error.message
                    }
                }
            }
        } else {
            return {
                status: false,
                message: "You don't have enough balance to complete this process"
            }
        }
       
    }

    async deleteTicket(id) {
        await this.tickets.destroy({
            where: {
                id: id
            },
        })

        return {
            status: true,
            message: "Ticket deleted successfully"
        }
    }
}




module.exports = Ticketing;