const Setup = require("../classes/setup.service");
const paymentSetup = require("../classes/paymentSetup.service");
const buildingService = require("../classes/building.service");
const businessService = require("../classes/business.service");
const { building } = require("../model/Buildings");
const { json } = require("sequelize");

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
    const yourState = req.user
    const response = await setup.state(req.query);
    res.status(200).render("./setup/location/state", { response,yourState  });
  },

  getLga: async function (req, res) {
    // const response = await setup.Items(req.query);
    res.status(200).render("./setup/location/lga");
  },

  getLgaWithOutRender: async function (req, res) {
    const response = await setup.lga(req.query);
    return res.json(response)
    
  },
  getWard: async function (req, res) {
    // console.log("available query",req.user)
    const lgaId = req.user.lga.split(", ")[0]; 
    // console.log(lgaId)
    const response = await setup.ward(lgaId);
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
      await buildingService.addBuildingType(req.body);
      res
        .status(200)
        .json({ success: true, message: "Building Type created successfully" });
    } catch (error) {
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
};
