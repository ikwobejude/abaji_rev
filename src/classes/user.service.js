const validation = require("../lib/input_validation")
const User_groups = require("../model/User_group")
const Users = require("../model/Users")

class User {
    constructor(){
        this.users = Users
        this.user_group = User_groups,
        this.inputValidate = validation
    }

    async userGroup() {
        return await this.user_group.findAll({ new: true })
    }

    async createUserGroup(data) {
        const { value, error }  = this.inputValidate.validateUserGrpp(data)
        if(error) {
            throw Error(error.message)
        } else {
            await this.user_group.create({
                group_id: value.group_id,
                group_name: value.group_name,
            })

            return {
                status: true,
                message: "creates"
            }
        }
        
    }
}

module.exports = User