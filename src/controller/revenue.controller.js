const Wallet = require("../classes/wallet.service");
const wallet = new Wallet();
const Revenue = require("../classes/revenue.service");
const User = require("../classes/user.service");

const revenue = new Revenue();
const user = new User();

module.exports = {
  getRevenueItemByYear: async function (req, res) {
    const response = await revenue.revenueByYear(req.query);
    res
      .status(200)
      .render("./revenue/cooperative/upload_records", { ...response });
  },

  createAssessments: async function (req, res) {
    try {
      const response = await revenue.uploadCooperateBusinessData(req.body);
      res.status(200).json(response);
    } catch (error) {}
  },

  viewAssessmentInvoice: async function (req, res) {
    const response = await revenue.revenuesInvoices({ year: req.params.year });
    res
      .status(200)
      .render("./revenue/cooperative/revenue_invoice", { ...response });
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
  postUser: async function (req, res) {
    try {
      const response = await user.createUser({...req.body, service_id: req.user.service_id, service_code: req.user.service_code});
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
    const users = await user.getUser();

    console.log({ users });
    res.status(200).render("./users/users", { ...usergroup, ...users });
  },
};
