const Wallet = require("../classes/wallet.service");
const wallet = new Wallet();
const Revenue = require("../classes/revenue.service");
const User = require("../classes/user.service");
const Setup = require("../classes/setup.service");
const permission = require("../classes/permission.service");
const revenue = new Revenue();
const user = new User();
const setup = new Setup();
module.exports = {
  getRevenueItemByYear: async function (req, res) {
    const response = await revenue.revenueByYear({...req.query, service_id: req.user.service_id});
    res.status(200).render("./revenue/cooperative/upload_records", {
      ...response,
    });
  },

  createAssessments: async function (req, res) {
    try {
      const response = await revenue.uploadCooperateBusinessData({
        ...req.body,
        service_id: req.user.service_id,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
  viewAssessmentInvoice: async function (req, res) {
    try {
      const query = {
        year: req.query.year || req.params.year,
        street: req.query.street,
        assessment_no: req.query.assessment_no,
        revenue_code: req.query.revenue_code,
        bill_ref_no: req.query.bill_ref_no,
        name_of_business: req.query.name_of_business,
        address_of_property: req.query.address_of_property,
        type_of_property: req.query.type_of_property,
        revenue_type: req.query.revenue_type,
      };

      const response = await revenue.revenuesInvoices(query);
      const street = await setup.AllStreets();
      res.status(200).render("./revenue/cooperative/revenue_invoice", {
        ...response,
        ...street,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },

  viewBatchAssessmentInvoice: async function (req, res) {
    try {
      const query = {
        batch: req.query.batch || req.params.batch,
        street: req.query.street,
        assessment_no: req.query.assessment_no,
        revenue_code: req.query.revenue_code,
        bill_ref_no: req.query.bill_ref_no,
        name_of_business: req.query.name_of_business,
        address_of_property: req.query.address_of_property,
        type_of_property: req.query.type_of_property,
        revenue_type: req.query.revenue_type,
      };
      console.log(query);
      const response = await revenue.revenuesInvoices(query);
      const street = await setup.AllStreets();
      res.status(200).render("./revenue/cooperative/revenue_invoice", {
        ...response,
        ...street,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  },


  deleteYearly: async function (req, res) {
    try {
      const response = await revenue.truncateYearlyRecord(req.query);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: error.message });
    }
  },


  generate_pay_code: async function (req, res) {
    try {
      const response = await revenue.generate_pay_code_bud_pay(req.query);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: true,
        message: error.message,
      });
    }
  },


  demandNotice: async function (req, res) {
    const response = await revenue.demandNotice(req.params);
    res
      .status(200)
      .render("./revenue/cooperative/demand_notice", { ...response });
  },

  getWalletBalance: async function (req, res) {
    const balance = await wallet.walletBalance(req.user.id);
    res.status(200).json(balance);
  },

  walletPayment: async function (req, res) {},

  // users
  getUserRoles: async function (req, res) {
    const request = await user.userGroup();
    res.status(200).render("./users/user_role", { ...request });
  },
  postUserRoles: async function (req, res) {
    try {
      const response = await user.createUserGroup(req.body);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  editUserRole: async function (req, res) {
    try {
      // console.log(req.body)
      const response = await user.editUserGroup(req.body);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  deleteUserRole: async function (req, res) {
    try {
      const response = await user.deleteUserRole(req.query.id);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },


  postUser: async function (req, res) {
    try {
      const response = await user.createUser({
        ...req.body,
        service_id: req.user.service_id,
        service_code: req.user.service_code,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  getUser: async function (req, res) {
    const usergroup = await user.userGroup();
    const users = await user.getUser(req.user.service_id);
    const perm = await permission.retrieve();
    res
      .status(200)
      .render("./users/users", { ...usergroup, ...users, ...perm });
  },

  addPermissionsToUser: async function (req, res) {
    try {
      const data = req.body;
      const permissions = data.permissions.toString();
      const updatedUser = await user.addPermissionToUser(data.userId, permissions);

      res.status(201).json({
        success: true,
        message: "Permissions added successfully",
        user: updatedUser
      });
    } catch (error) {
      console.error("Error adding permissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add permissions: " + error.message,
      });
    }
  },
  
  deleteUser: async function (req, res) {
    const { userId } = req.params;

    try {
      const response = await user.deleteUser(userId);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  updateUser: async function (req, res) {
    const { userId } = req.params;
    const data = req.body;

    try {
      const response = await user.updateUser(userId, data);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  addDiscount: async function (req, res) {
    const { invoice } = req.params;
    const response = await revenue.initiateDiscount(invoice, req.body);
    res.status(200).json(response);
  },

  addDiscount: async function (req, res) {
    const { invoice } = req.params;
    const response = await revenue.initiateDiscount(invoice, req.body);
    res.status(200).render();
  },

  upload_payment_batch: async function (req, res) {
    const response = await revenue.viewUploadedPaymentbATCH(req.query);
    res
      .status(200)
      .render("./revenue/cooperative/upload_payments_batch", { ...response });
  },

  upload_payment_rec: async function (req, res) {
    const response = await revenue.viewUploadedPayment({
      ...req.query,
      ...req.params,
    });
    res
      .status(200)
      .render("./revenue/cooperative/upload_payments", { ...response });
  },

  upload_payment_del: async function (req, res) {
    try {
      const response = await revenue.deleteBatchUpload(req.params.batch);
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },

  upload_payment: async function (req, res) {
    try {
      // console.log(req.body)
      const response = await revenue.upload_payments({
        ...req.body,
        ...req.user,
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  },
};
