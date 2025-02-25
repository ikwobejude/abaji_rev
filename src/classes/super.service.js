const eventEmitter = require("events");
const clientService = require("../model/Client");
const User_groups = require("../model/User_group");
const Users = require("../model/Users");
const Tax_offices = require("../model/Office");

const emitter = new eventEmitter();
require("../events/validation/schema")(emitter);

class SuperService {
  constructor() {
    this.client = clientService;
    this.users = Users;
    this.roles = User_groups;
  }

  async createOffice(body) {
    try {
      console.log(Date.now());
      emitter.emit("beforeCreateOffice", body);

      await Tax_offices.create({
        tax_office_id: Date.now(),
        tax_office: body.office,
        service_id: body.service_id,
        created_by: body.username,
        created_at: new Date(),
        office_address: body.office_address.trim(),
        phone_number: body.office_phone,
      });


      if (!body.id) {
        console.error("Missing user ID");
        return { status: false, message: "User ID is required" };
      }

    //   console.log(body)
      if (body) {
        console.log("Current authStep:", body.authStep);
        let newAuthStep = body.authStep;
        if (body.authStep === 13) {
          newAuthStep += 1;
        }

         await Users.update(
          { authStep: newAuthStep,
            ended_onboarding: true,
            finished_onboarding:true
           },
          { where: { id: body.id } } 
        );
      }

      return {
        status: true,
        message: "Success",
      };
    } catch (error) {
      console.error("Error in createOffice:", error);
      return { status: false, message: error.message };
    }
  }

  async allOffices(query) {
    return await Tax_offices.findAll({
      where: { service_id: query.service_id },
      raw: true,
    });
  }


}

module.exports = new SuperService();
