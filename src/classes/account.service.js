const Accounts = require("../model/Account");
const Users = require('../model/Users')
class Account {
  constructor() {
    this.account = Accounts;
    this.users = Users
  }

  async createAccount(data) {
    console.log({ data });
    const accountExists = await this.account.findOne({
      where: { service_id: data.service_id },
    });
    if (accountExists) {
      throw new Error("Local Government Account Already exists");
    }
    await this.account.create({
      service_id: data.service_id,
      lga_account_number: data.account_number,
      lga_account_name: data.account_name,
      lga_bank_name: data.bank_name,
      created_by: data.user,
      approval_status: false,
    });
    const user = await this.users.findOne({ where: { id: data.user_id } });
    if (user) {
        let newAuthStep = user.authStep;
        
        if (user.authStep === 4) {
            newAuthStep += 1;
        }
        await this.users.update({ authStep: newAuthStep }, { where: { id: data.user_id } });
    }
    return {
      success: true,
      message: "Account created successfully",
    };
  }

  async fetchAccount(service_id) {
    const account = await this.account.findOne({
      where: { service_id: service_id },
      raw: true,
    });
    return account || {};
  }
}

module.exports = new Account();
