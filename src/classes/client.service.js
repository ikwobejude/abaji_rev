const bcrypt = require("bcryptjs");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const salt = bcrypt.genSaltSync(10);
const Sequelize = require("sequelize");
const eventEmitter = require("events");
const clientService = require("../model/Client");
const Setups = require("../model/Client");
const Users = require("../model/Users");
const State = require("../model/State");
const Lga = require("../model/Lga");
const emitter = new eventEmitter();

// register events
// require('../events/notifications')(emitter)
require("../events/validation/clientServiceValidation")(emitter);

class Client {
  constructor() {
    this.client_service = clientService;
    this.initial_setup = Setups;
    this.state = State;
    this.Lga = Lga;
  }

  password() {
    return new Date().getTime().toString(36);
  }

  acronyms(str) {
    // console.log({str})
    // Trim any extra spaces
    // const name = str.trim();
    if (!str) return ""; // Handle empty string

    if (str.indexOf(" ") === -1) {
      return str.slice(0, 4).toUpperCase();
    } else {
      let matches = str.match(/\b(\w)/g) || [];
      return matches.join("").toUpperCase();
    }
  }

  async resizeImg(file) {
    const outputPath = path.join(__dirname, "../../public/uploads/");

    // Get the uploaded image file path
    const imagePath = file.path;
    // Read and process the image using Jimp
    // console.log({ imagePath });
    const image = await Jimp.read(imagePath);
    // console.log({ image });

    // Perform image processing, like resizing, converting, etc.
    image
      .resize(612, 383) // Resize the image to 250px width
      .quality(80) // Set image quality to 80
      // .greyscale()             // Apply greyscale filter
      .write(path.join(outputPath, file.filename));

    return file.filename;
  }

  async create(value) {
    // console.log({ value });
    emitter.emit("beforeCreateClientService", value);

    // Check for duplicate email or phone
    const existingClient = await this.client_service.findOne({
      where: {
        [Sequelize.Op.or]: [
          { client_email: value.client_email },
          { client_phone: value.client_phone },
        ],
      },
    });

    if (existingClient) {
      if (existingClient.client_email === value.client_email) {
        throw new Error(`The email '${value.client_email}' is already in use.`);
      }
      if (existingClient.client_phone === value.client_phone) {
        throw new Error(
          `The phone number '${value.client_phone}' is already in use.`
        );
      }
    }

    const adminPss = this.password();
    console.log(adminPss, "After resize");
    await this.resizeImg(value);
    // console.log(adminPss, "Before resize")

    // Proceed with client creation
    await this.client_service.create({
      client: value.client,
      service_code: this.acronyms(value.client),
      client_phone: value.client_phone,
      client_email: value.client_email,
      country: value.country_id,
      country_code: "NG",
      admin_surname: value.admin_surname,
      admin_firstname: value.admin_first_name,
      admin_middlename: value.admin_middlename,
      client_admin_phone: value.client_admin_phone,
      client_admin_email: value.client_admin_email,
      client_admin_pwd: await bcrypt.hash(adminPss, salt),
      service_logo: `/uploads/${value.filename}`,
      client_address: "Address",
      service_authentication_code: this.acronyms(value.client_name),
      permissions:
        "46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65",
    });

    // const details = {
    //   client: value.client_name,
    //   email: value.client_email.toLowerCase(),
    //   client_admin_email:
    //     "admin@" + this.acronyms(value.client_name).toLowerCase(),
    //   admin_pass: adminPss,
    //   url: "",
    //   Contact: "SMART REVENUE CUSTOMER SERVICE DESK",
    //   Email: "info@authhub.com",
    //   Phone: "070 00000 000",
    //   template: "client_signup",
    //   subject: "Client email registration notification",
    // };

    // emitter.emit("afterCreatingClientService", details);

    return {
      status: true,
      message:
        "Client created & email has been sent to the client registered email address",
    };
  }

  async setup(data) {
    // console.log(data)
    emitter.emit("beforeInitialSetup", data);
    await this.initial_setup.upsert({
      service_id: data.service_id,
      category: data.category,
      publisher: data.publisher,
      quiz: data.quiz,
      certificate_at_end_of_course: data.certificate_at_end_of_course,
      setup_by: data.setup_by,
    });

    await this.activateCLientService(data.service_id);

    await shlSessions.upsert({
      acd_session: `${
        new Date().getFullYear() - 1
      }/${new Date().getFullYear()}`,
      service_id: data.service_id,
      registeredBy: data.created_by,
    });

    return {
      status: true,
      message: "Setup saved",
    };
  }

  async activateCLientService(service_id) {
    return await this.client_service.update(
      { service_status: 1 },
      { where: { service_id: service_id } }
    );
  }

  async findClientByServiceId(service_id) {
    return await this.client_service.findOne({
      where: {
        service_id: service_id,
      },
      include: {
        model: Users,
        attributes: ["id", "username", "user_phone"],
      },
    });
  }
  async updateClientStateAndLga(data, clientId) {
   const response = await clientService.update(
     {
       state: data.state,
       lga: data.lga,
       client_admin_phone: data.phone_number,
     },
     {
       where: { service_id: clientId },
     }
   );
    return {
      success: true,
      message: "Client state and LGA updated successfully",
    };
  }
  async getClientDetails(serviceId) {
    return await clientService.findOne({
      where: { service_id: serviceId },
      raw: true,
      attributes: ["state", "client_admin_phone"],
    });
  }
}

module.exports = new Client();
