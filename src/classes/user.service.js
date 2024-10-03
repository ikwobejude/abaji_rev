const { randomNum } = require("../helper/helper");
const validation = require("../lib/input_validation");
const User_groups = require("../model/User_group");
const Users = require("../model/Users");
const bcrypt = require("bcryptjs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Permissions = require("../model/Permission");
class User {
  constructor() {
    this.users = Users;
    this.permissions = Permissions;
    (this.user_group = User_groups), (this.inputValidate = validation);
  }

  async userGroup() {
    const user_role = await this.user_group.findAll({ new: true });
    return { user_role };
  }

  async createUserGroup(data) {
    await this.user_group.create({
      group_id: data.group_id,
      group_name: data.group_name,
    });

    return {
      status: true,
      message: "Successfully Created",
      // };
    };
  }
  async editUserGroup(data) {
    try {
      // Find the group by its ID
      const group = await this.user_group.findOne({
        where: { idgroups: data.id },
      });
      if (!group) {
        return {
          status: false,
          message: "User Role not found",
        };
      }
      await group.update({
        group_name: data.user_role,
      });

      return {
        status: true,
        message: "User Role updated successfully",
        data: group,
      };
    } catch (error) {
      console.error("Error updating user group:", error);
      return {
        status: false,
        message: "Error updating user group",
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
      service_code,
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
      service_code: service_code,
    });

    return { status: true, message: "User created successfully." };
  }
  async getUser() {
    const users = await this.users.findAll();

    const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
        const userPermissionsIds = user.permissions;
        // console.log(userPermissionsIds);
        const userPermissions = await Promise.all(
          userPermissionsIds.map(async (permissionId) => {
            const permission = await this.permissions.findOne({
              where: { permission_id: permissionId },
            });

            return permission ? permission.permission_name : null;
          })
        );
        return {
          ...user.get(),
          permissions: userPermissions.filter(Boolean),
        };
      })
    );

    // Return the result
    return { users: usersWithPermissions };
  }

  async addPermissionToUser(data) {
    const id = data.userId;

    const user = await this.users.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.permissions) {
      user.permissions = [];
    }

    // manage unique permissions
    const currentPermissions = new Set(user.permissions);

    // Add new permissions to the Set
    data.permissions.forEach((permission) => {
      if (!currentPermissions.has(permission)) {
        currentPermissions.add(permission);
      } else {
        console.warn(`Permission "${permission}" already exists for this user`);
      }
    });

    user.permissions = Array.from(currentPermissions);

    await user.save();
    return user;
  }

  async validateUserEmail(email) {
    const user = await Users.findOne({
      attributes: ["name", "user_phone", "id"],
      where: {
        [Op.or]: [{ username: email }, { email: email }],
      },
      raw: true,
    });

    if (user) {
      return {
        status: true,
        data: user,
      };
    } else {
      return {
        status: false,
        error: "User with the email address does not exist",
      };
    }
  }

  async deleteUserRole(id) {
    await this.user_group.destroy({ where: { idgroups: id } });
    return { status: true, message: "User group deleted successfully." };
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
