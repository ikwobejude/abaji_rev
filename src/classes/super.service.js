const eventEmitter = require('events')
const clientService = require("../model/Client");
const User_groups = require("../model/User_group");
const Users = require("../model/Users");
const Tax_offices = require('../model/Office');

const emitter = new eventEmitter();
require('../events/validation/schema')(emitter)

class SuperService {
    constructor(){
        this.client = clientService
        this.users = Users
        this.roles = User_groups
    }

    async dashboard() {

        const count = await this.client.count({raw: true});
        const rows = await this.client.findAll({ where: { service_status: 0 }, limit: 5, raw: true})
        const users = await this.users.count()

        console.log(rows, count)
        return {
            clients: rows, users, count
        }
    }


    async createOffice(body) {
        console.log(Date.now())
        emitter.emit("beforeCreateOffice", body);
        await Tax_offices.create({
            tax_office_id: Date.now(),
            tax_office: body.office,
            service_id: body.service_id,
            created_by: body.username,
            created_at: new Date(),
            office_address: body.office_address.trim(),
            phone_number: body.office_phone
        })
        return {
            status: true,
            message: "Success"
        }
    }

    async allOffices(query) {
        return await Tax_offices.findAll({ where: { service_id: query.service_id }, raw: true})
    }
}

module.exports = new SuperService()