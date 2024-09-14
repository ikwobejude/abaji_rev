const axios = require("axios");
const SettlePayment = require("./payment.service");
require("dotenv").config();

class BudPay extends SettlePayment {
  constructor() {
    super()
    this.baseUrl = "https://api.budpay.com/api/v2";
    this.secretKey = process.env.BUDPAY_SECRET_KEY;
  }

  async createInvoice(invoiceData) {
    // console.log(process.env.BUDPAY_SECRET_KEY)
    try {
      const response = await axios.post(
        `${this.baseUrl}/create_invoice`,
        invoiceData,
        {
          headers: {
            Authorization: `Bearer ${process.env.BUDPAY_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("Received response from invoice creation:", response.data);
      return response.data;
    } catch (error) {
      // console.error("Error response data:", error.response?.data);
      // console.error("Error response status:", error.response?.status);
      // console.error("Error response headers:", error.response?.headers);
      throw new Error(error.response?.data?.message || error.message);
    }
  }
  //  Standard Checkout
  async createStandardCheckout(checkoutData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        checkoutData,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error( error);
    }
  }
  async callback(invoiceNumber) {
    console.log({ invoiceNumber });
    try {
      const response = await axios.get(
        `${this.baseUrl}/transaction/verify/${invoiceNumber}`,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }


  async webhook(query) {
    // console.log({query})
    return this.settle_payment(query)
  }

}

module.exports = BudPay
