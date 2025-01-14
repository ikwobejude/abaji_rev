const Admin = require("../classes/dashboard.service");
const User = require("../classes/user.service");
const Client = require("../classes/client.service");
const Setup = require("../classes/setup.service");
const user = new User();
const admin = new Admin();
const setup = new Setup();
class DashboardController {
  static async adminDashboard(req, res) {
    try {
      const states = await setup.state(); 
      const stateId = req.query.state_id; 
      const lgas = stateId ? await setup.lga(stateId) : []; 
      const userDetails = await Client.getClientDetails(req.user.service_id);
     
      const datatoPass = {
        ...userDetails,
        ...req.user,
      };
      const data = await admin.adminDashboard(req.user.service_id);
      res
        .status(200)
        .render("./dashboard", { states, lgas, ...data, datatoPass });
    } catch (error) {
      console.error("Error in adminDashboard:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async revenueStreet(req, res) {
    try {
      const data = await admin.streetExpectedGraph(req.user.service_id);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in revenueStreet:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async paymentsStreet(req, res) {
    try {
      const data = await admin.streetPaymentGraph(req.user.service_id);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in paymentsStreet:", error);
      res.status(500).send("Internal Server Error");
    }
  }


  static async revenueGenerated(req, res) {
    try {
      const data = await admin.generatedEnumerationGraph({service_id: req.user.service_id, status: req.params.status});
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in paymentsStreet:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async walletPayment(req, res) {
    try {
      const data = await admin.walletPayment(req.user.service_id);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error in walletPayment:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getAllUsers(req, res) {
    try {
      // Implement logic here if needed
      res
        .status(200)
        .json({ message: "Get all users endpoint not implemented yet" });
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getProfile(req, res) {
    try {
      res.status(200).render("profile");
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getUserGroup(req, res) {
    try {
      const response = await user.userGroup();
      res.status(200).render("", { response });
    } catch (error) {
      console.error("Error in getUserGroup:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  static async getRevenueUGraph(req, res) {
    try {
      const response = await admin.revenueGraph(req.user);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in getRevenueUGraph:", error);
      res.status(500).send("Internal Server Error");
    }
  }
  static async updateClientDetails(req, res) {
    try {
      const clientId = req.user.service_id;
      const response = await Client.updateClientStateAndLga(req.body, clientId);
      res.status(200).json(response);
    } catch (error) {
      console.error("Error in updateClientDetails:", error);
      res.status(500).send("Internal Server Error");
    }
  }
  static async security(req, res) {
    try {
      res.status(200).render("security");
    } catch (error) {
      console.error("Error in security:", error);
      res.status(500).send("Internal Server Error");
    }
  }
}

module.exports = DashboardController;
