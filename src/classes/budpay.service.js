const axios = require("axios");
require("dotenv").config();

class BudPay {
  constructor() {
    this.baseUrl = "https://api.budpay.com/api/v2";
    this.secretKey = process.env.BUDPAY_SECRET_KEY;
  }

  async createInvoice(invoiceData) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/create_invoice`,
        invoiceData,
        {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Received response from invoice creation:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
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
  async handleWebhook() {}
}

module.exports = BudPay;