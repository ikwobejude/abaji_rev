const { randomNum } = require("../helper/helper")
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
        const user_role = await this.user_group.findAll({ new: true })
        return { user_role }
    }

    async createUserGroup(data) {
        // console.log(data)
        const { value, error }  = this.inputValidate.validateUserGrpp.validate(data)
        if(error) {
            throw Error(error.message)
        } else {
            await this.user_group.create({
                group_id: randomNum(6),
                group_name: value.user_role,
            })

            return {
                status: true,
                message: "creates"
            }
        }
        
    }
}

module.exports = User