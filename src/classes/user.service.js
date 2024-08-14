const { randomNum } = require("../helper/helper");
const validation = require("../lib/input_validation");
const User_groups = require("../model/User_group");
const Users = require("../model/Users");
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize")
const Op = Sequelize.Op;

class User {
  constructor() {
    this.users = Users;
    (this.user_group = User_groups), (this.inputValidate = validation);
  }

  async userGroup() {
    const user_role = await this.user_group.findAll({ new: true });
    return { user_role };
  }

  async createUserGroup(data) {
    const { value, error } = this.inputValidate.validateUserGrpp(data);
    if (error) {
      throw Error(error.message);
    } else {
      await this.user_group.create({
        group_id: value.group_id,
        group_name: value.group_name,
      });

      return {
        status: true,
        message: "creates",
      };
    }
  }
  async createUser(data) {
    const {
      group_id,
      surname,
      firstname,
      middlename,
      password,
      user_phone,
      email,
      service_id,
      service_code
    } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await this.users.findOne({ where: { email } });
    if (existingUser) {
      throw new Error("Email taken");
    }
    await this.users.create({
      group_id,
      name: `${firstname} ${middlename} ${surname}`,
      password: hashedPassword,
      user_phone,
      email,
      username: email,
      service_id: service_id,
      service_code: service_code
    });

    return { status: true, message: "User created successfully." };
  }
  async getUser() {
    const users = await this.users.findAll();
    return { users };
  }

  async validateUserEmail(email){
    const user = await Users.findOne({attributes:['name', "user_phone", "id"],
      where: {
        [Op.or]: [{ username: email }, { email: email }],
      },
      raw: true
    });
  
    if(user){
      return {
        status: true,
        data: user
      }
    } else {
      return {
        status: false,
        error: "User with the email address does not exist"
      }
    }
  };
}

module.exports = User;
