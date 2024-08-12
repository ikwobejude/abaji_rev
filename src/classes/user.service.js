const { randomNum } = require("../helper/helper");
const validation = require("../lib/input_validation");
const User_groups = require("../model/User_group");
const Users = require("../model/Users");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

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
    });

    return { status: true, message: "User created successfully." };
  }
  async getUser() {
    const users = await this.users.findAll();
    return { users };
  }
  async deleteUser(userId) {
    const user = await this.users.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    await user.destroy();
    return { status: true, message: "User deleted successfully." };
  }
  async updateUser(userId, data) {
    const { group_id, name, password, user_phone, email } = data;

    const user = await this.users.findByPk(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (email) {
      const existingUser = await this.users.findOne({
        where: { email, id: { [Op.ne]: userId } },
      });
      if (existingUser) {
        throw new Error("Email is already in use by another user");
      }
    }

    user.group_id = group_id || user.group_id;
    user.name = name || user.name;
    user.user_phone = user_phone || user.user_phone;
    user.email = email || user.email;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    return { status: true, message: "User updated successfully." };
  }
}

module.exports = User;
