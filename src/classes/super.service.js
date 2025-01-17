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
        const clients = await this.client.count();
        const users = await this.users.count()

        return {
            clients, users
        }
    }
}

module.exports = new SuperService()