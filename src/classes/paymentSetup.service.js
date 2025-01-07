const db = require("../db/connection");
const { interSwitchPay } = require("../lib/input_validation");
const Interswitch = require("../model/Inter_switch");
const users = require("../model/Users");
class paymentSetup {
  constructor() {
    this.db = db;
    this.inter_switch = Interswitch;
    this.users = users;
  }

  async interSwitchPost(data) {
    const validatedData = await interSwitchPay.validateAsync(data, {
      abortEarly: false,
    });
    await this.inter_switch.create(validatedData);
    return {
      success: true,
      message: "Payment setup successful",
    };
  }
  async interSwitchFetch() {
    try {
      const usersData = await this.users.findAll({
        attributes: ["id", "name", "email", "user_phone"],
        raw: true,
      });
      const data = await this.inter_switch.findAll({
        raw: true,
      });
      const pairedData = data.map((payment) => {
        const user = usersData.find((u) => u.id == payment.created_by);

        return {
          ...payment,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                user_phone: user.user_phone,
              }
            : null,
        };
      });
      return {
        success: true,
        data: pairedData,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = paymentSetup;
