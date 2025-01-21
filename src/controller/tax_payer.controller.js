const taxpayer = require("../classes/taxpayer.service");
const tcc_calculation = require("../classes/tcc_calculation.service");

class TaxPayerController {
  static async createTaxPayer(req, res) {
    try {
      const response = await taxpayer.create({
        service_id: req.user.service_id,
        ...req.body,
      });
      console.log(response);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  static async taxPayers(req, res) {
    const response = await taxpayer.findAll({
      service_id: req.user.service_id,
      ...req.query,
    });
    res.status(200).render("./tax_payers/tax_payer", response);
    // res.status(201).json(response)
  }

  static async getTCCRequest(req, res) {
    const response = await tcc_calculation.findAll({
      service_id: req.user.service_id,
      ...req.query,
    });
    res.status(200).render("./tax_payers/tcc_requests", response);
    // res.status(201).json(response)
  }

  static async generateTCC(req, res) {
    try {
      console.log(req.body)
      const response = await tcc_calculation.generateTCC({ service_id: req.user.service_id, ...req.body})
      res.status(201).json(response)
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = TaxPayerController;
