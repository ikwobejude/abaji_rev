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

const emitter = new eventEmitter();

// register events
// require('../events/notifications')(emitter)
require("../events/validation/clientServiceValidation")(emitter);

class Client {
  constructor() {
    this.client_service = clientService;
    this.initial_setup = Setups;
  }

  password() {
    return new Date().getTime().toString(36);
  }

  acronyms(name) {
    // Trim any extra spaces
    name = name.trim();

    // Check if it's a single word (no spaces)
    if (name.indexOf(" ") === -1) {
      // Return the first 4 characters, uppercased
      return name.substring(0, 4).toUpperCase();
    } else {
      // If more than one word, return the initials
      let matches = name.match(/\b(\w)/g); // Get the first letter of each word
      return matches.join("").toUpperCase(); // Join and return in uppercase
    }
  }

  async create(value) {
    console.log({ value });
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
    await this.resizeImg(value);

    // Proceed with client creation
    await this.client_service.create({
      client: value.client_name,
      service_code: this.acronyms(value.client_name),
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
    });

    const details = {
      client: value.client_name,
      email: value.client_email.toLowerCase(),
      client_admin_email:
        "admin@" + this.acronyms(value.client_name).toLowerCase(),
      admin_pass: adminPss,
      url: "",
      Contact: "SMART REVENUE CUSTOMER SERVICE DESK",
      Email: "info@authhub.com",
      Phone: "070 00000 000",
      template: "client_signup",
      subject: "Client email registration notification",
    };

    emitter.emit("afterCreatingClientService", details);

    return {
      status: true,
      message:
        "Client created & email has been sent to the client registered email address",
    };
  }

  async resizeImg(file) {
    const outputPath = path.join(__dirname, "../../public/uploads/");

    // Get the uploaded image file path
    const imagePath = file.path;
    // Read and process the image using Jimp
    console.log({ imagePath });
    const image = await Jimp.read(imagePath);
    console.log({ image });

    // Perform image processing, like resizing, converting, etc.
    image
      .resize(612, 383) // Resize the image to 250px width
      .quality(80) // Set image quality to 80
      // .greyscale()             // Apply greyscale filter
      .write(path.join(outputPath, file.filename));

    return file.filename;
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
        model: Users, // The User model you associated with the Client
        attributes: ["id", "username", "user_phone"], // Select the fields you need from the User
      },
    });
  }
}

module.exports = new Client();
