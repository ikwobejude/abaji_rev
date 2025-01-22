const EventsEmitter = require("events");
const Permissions = require("../model/Permission");
const User_groups = require("../model/User_group");

const emitter = new EventsEmitter()


// Event register
require('../events/validation/permission')(emitter)
require('../events/logging')(emitter)


class Permission {
    constructor() {
        this.permission = Permissions
        this.roles = User_groups
    }

    async retrieve() {
        const permission = await this.permission.findAll({raw: true});
        const roles = await this.roles.findAll({raw: true});
        return {
            permission, roles
        }
    }

    async create(body) {
        try {
            emitter.emit("beforeCreatingPermission", body)
            const permissions = body.permission.split(",")
            let arr = []
            permissions.forEach(permission => {
                arr.push({
                    permission_name: permission
                })
            });
            await this.permission.bulkCreate(arr);
            return {
                status: true,
                message: "created"
            }
        } catch (error) {
            emitter.emit("CreationError", error)
            throw error
        }
    }

    async modify(body) {
        try {
            emitter.emit("beforeCreatingPermission", body)
           
            await this.permission.update({
                permission_name: body.permission
            }, {
                where: {
                    permission_id: body.id
                }
            }, {new: true});
            return {
                status: true,
                message: "Updates"
            }
        } catch (error) {
            emitter.emit("CreationError", error)
            throw error
        }
    }

    async delete(id) {
        await this.permission.destroy({ where: {permission_id: id}})
        return {
            status: true,
            message: "Deleted"
        }
    }


}

module.exports = new Permission();