const clientService = require("../model/Client");
const User_groups = require("../model/User_group");
const Users = require("../model/Users");

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
}

module.exports = new SuperService()