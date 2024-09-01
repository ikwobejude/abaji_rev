const BudPay = require("../classes/budpay.service");

const Pay = new BudPay();
module.exports = {
  createInvoice: async function (req, res) {
    const invoiceNumber = `invoice_${Date.now()}`;
    const invoiceData = {
      title: req.body.title,
      duedate: req.body.duedate,
      currency: req.body.currency,
      invoicenumber: invoiceNumber,
      reminder: req.body.reminder,
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      billing_address: req.body.billing_address,
      billing_city: req.body.billing_city,
      billing_state: req.body.billing_state,
      billing_country: req.body.billing_country,
      billing_zipcode: req.body.billing_zipcode,
      items: req.body.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        meta_data: item.meta_data,
      })),
    };
    if (!invoiceData) {
      return res.status(400).json({ error: "Invoice Data is Required" });
    }
    try {
      const invoiceResponse = await Pay.createInvoice(invoiceData);
      res.status(200).json({ invoiceResponse });
    } catch (error) {
      console.log(`Error generating invoice: ${error.message}`);
      console.error("Full error:", error);
      res.status(500).json({ error: error.message });
    }
  },
  standardCheckout: async function (req, res) {
    const invoiceNumber = `invoice_${Date.now()}`;
    const checkoutData = {
      email: req.body.email,
      amount: req.body.amount,
      currency: "NGN",
      reference: invoiceNumber,
      callback: `https://1c17-105-112-230-161.ngrok-free.app/pay/budpay`,
    };
    if (!checkoutData) {
      return res.status(400).json({ error: "Checkout data is required" });
    }
    try {
      const checkoutResponse = await Pay.createStandardCheckout(checkoutData);
      res.status(200).json({ checkoutResponse });
    } catch (error) {
      console.error("Error during standard checkout:", error.message);
      res.status(500).json({ error: error.message });
    }
  },

  callback: async function (req, res) {
    const { invoiceNumber } = req.params;
    try {
      console.log(invoiceNumber);
      const response = await Pay.callback(invoiceNumber);
      res.status(200).json({ response });
    } catch (error) {
      console.error("Error getting invoice status:", error.message);
      res.status(500).json({ error: "Failed to get invoice status" });
    }
  },
  webhook: async function (req, res) {
    const data = req.body;
    console.log({ data });
    console.log("testing webhook");
    if (data.data.status == "success") {
      // Update User Payment Status
      console.log("Payment Confirmed by budpay");
    } else {
      console.log("Payment failed, try again...");
    }
  },
};
