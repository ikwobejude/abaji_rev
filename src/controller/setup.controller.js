const Setup = require("../classes/setup.service");
const paymentSetup = require("../classes/paymentSetup.service");
const buildingService = require("../classes/building.service");
const businessService = require("../classes/business.service");
const accountService = require("../classes/account.service");
const approvalService = require("../classes/approval.service");
const { building } = require("../model/Buildings");
const { json } = require("sequelize");
const { createOffice, allOffices } = require("../classes/super.service");

// const building = new buildingService();
// const business = new businessService();
const setup = new Setup();
const payment = new paymentSetup();
module.exports = {
  getTicketItem: async function (req, res) {
    const response = await setup.Items(req.query);
    res
      .status(200)
      .render("./setup/items/ticket_revenue_item_setup", { ...response });
  },

  postTicketItem: async function (req, res) {
    try {
      const response = await setup.addItem(req.body, req.user.service_id);
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
  editTicketItem: async function (req, res) {
    try {
      const response = await setup.editItem(req.params.id, req.body);
      console.log({ response });
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  deleteTicketItem: async function (req, res) {
    try {
      const response = await setup.deleteItem(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
  getState: async function (req, res) {
    const yourState = req.user;
    const response = await setup.state(req.query);
    res.status(200).render("./setup/location/state", { response, yourState });
  },

  getLga: async function (req, res) {
    // const response = await setup.Items(req.query);
    res.status(200).render("./setup/location/lga");
  },

  getLgaWithOutRender: async function (req, res) {
    const response = await setup.lga(req.query);
    return res.json(response);
  },
  getWard: async function (req, res) {
    // console.log("available query",req.user)
    const lgaId = req?.user?.lga?.split(", ")[0] || null;
    // console.log(lgaId)
    const response = await setup.ward(lgaId, req.user.group_id);
    res.status(200).render("./setup/location/ward", { ...response });
  },

  postWard: async function (req, res) {
    try {
      console.log(req.body);
      const response = await setup.createWard(req.body, req.user.service_id);
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
  editWard: async function (req, res) {
    try {
      const response = await setup.editWard(req.params.id, req.body);
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  deleteWard: async function (req, res) {
    try {
      const response = await setup.deleteWard(req.params.id);
      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
  getStreets: async function (req, res) {
    const response = await setup.AllStreets(req.query);
    res.status(200).render("./setup/location/street", { ...response });
  },

  getStreet: async function (req, res) {
    const response = await setup.findStreet(req.params);
    res.status(200).json(response);
  },

  postStreet: async function (req, res) {
    try {
      // console.log(req.body);
      const response = await setup.createStreet(req.body, req.user.service_id);
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  fetchInterSwitch: async function (req, res) {
    try {
      const response = await payment.interSwitchFetch();
      res.status(200).render("./setup/payment/interswitch", { ...response });
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
  postInterSwitch: async function (req, res) {
    console.log(req.user);
    try {
      const data = req.body;
      const payload = {
        ...data,
        service_id: req.user.service_id,
        created_by: req.user.id,
      };
      const response = await payment.interSwitchPost(payload);
      res.status(201).json(response);
    } catch (error) {
      console.error(error);
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
  building_categories: async function (req, res) {
    try {
      const response = await buildingService._building_categories(req.body);
      res.status(200).render("./enumeration/building_categories", { response });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "an error occured loading page",
      });
    }
  },
  create_building_category: async function (req, res) {
    try {
      await buildingService.add_building_category(req.body);
      res.status(200).json({ success: true, message: "Created Successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  building_types: async function (req, res) {
    try {
      const response = await buildingService.allBuildingType(req.query);
      const categories = await buildingService._building_categories();
      res
        .status(200)
        .render("./enumeration/building_types", { response, categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "an error occured loading page",
      });
    }
  },
  createBuildingType: async function (req, res) {
    try {
      // console.log(req.body)
      await buildingService.addBuildingType(req.body);
      res
        .status(200)
        .json({ success: true, message: "Building Type created successfully" });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  addBusinessCategory: async function (req, res) {
    try {
      await businessService.add_business_category(req.body);
      res.status(200).json({ success: true, message: "Created Successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
  getBusinessCategory: async function (req, res) {
    try {
      const response = await businessService._business_categories(req.query);
      res.status(200).render("./enumeration/business_categories", { response });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },
  addBusinessTypes: async function (req, res) {
    try {
      await businessService.add_business_types(req.body);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getBusinessTypes: async function (req, res) {
    try {
      const response = await businessService._business_type(req.query);
      res.status(200).render("./enumeration/business_types", { response });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getBusinessSizes: async function (req, res) {
    try {
      const response = await businessService._business_sizes(req.query);
      res.status(200).render("./enumeration/business_sizes", { response });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  addBusinessSizes: async function (req, res) {
    try {
      await businessService.add_business_sizes(req.body);
      res.status(201).json({ status: true, message: "Created Successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getBusinessSector: async function (req, res) {
    try {
      const response = await businessService._business_sector(req.query);
      res.status(200).render("./enumeration/business_sector", { response });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  addBusinessSector: async function (req, res) {
    try {
      await businessService.add_business_sector(req.body);
      res.status(201).json({ success: true, message: "Created Successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getBusinessOperations: async function (req, res) {
    try {
      const response = await businessService._business_operation(req.query);
      console.log(response);
      res.status(200).render("./enumeration/business_operations", { response });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  addBusinessOperations: async function (req, res) {
    try {
      await businessService.add_business_operation(req.body);
      res.status(201).json({ success: true, message: "Created Successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  createAccount: async function (req, res) {
    try {
      const { service_id, name } = req.user;
      console.log(req.user);

      const data = {
        ...req.body,
        service_id: service_id,
        user: name,
      };

      await accountService.createAccount(data);
      res.status(201).json({ success: true, message: "Created Successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error uploading account: ${error}`,
      });
    }
  },
  fetchAcct: async function (req, res) {
    try {
      const response = await accountService.fetchAccount(req.user.service_id);
      // console.log({ response });
      res
        .status(200)
        .render("./setup/payment/create_account", { account: response });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
  createApproval_types: async function (req, res) {
    try {
      const { service_id } = req.user;
      const data = {
        ...req.body,
        service_id: service_id,
      };
      await approvalService.createApprovalTypes(data);
      res
        .status(200)
        .json({ success: true, message: "Approval Type Created Successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `error creating: ${error.message}`,
      });
    }
  },
  fetch_approval_types: async function (req, res) {
    try {
      const response = await approvalService.fetchApprovalTypes(
        req.user.service_id
      );
      res
        .status(200)
        .render("./setup/approval/approval_type", { data: response });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `an error occured, ${error.message}`,
      });
    }
  },

  create_approval_level: async function (req, res) {
    try {
      await approvalService.create;
    } catch (error) {}
  },

  office: async (req, res) => {
    const response = await allOffices({ ...req.user, ...req.body });
    res.render("./setup/office/office", { response });
  },

  createOffices: async (req, res) => {
    try {
      const response = await createOffice({ ...req.user, ...req.body });
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
};
