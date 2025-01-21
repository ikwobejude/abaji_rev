const eventEmitter = require("events");
const Tax_items = require("../model/Tax_items");
const TaxPayers = require("../model/TaxPayers");
const { Op } = require("sequelize");

const emitter = new eventEmitter();
require("../events/validation/schema")(emitter);
class Taxpayer {
  constructor() {
    this.tax_payers = TaxPayers;
  }

  async create(body) {
    emitter.emit("beforeCreateTaxpayer", body);
    await this.tax_payers.create({
      taxpayer_name: body.taxpayer_name,
      taxpayer_tin: body.taxpayer_tin,
      mobile_number: body.mobile_number,
      email_addresss: body.email_addresss,
      tax_payer_type: body.tax_payer_type,
      service_id: body.service_id,
      contactaddress: body.contactaddress,
      photo_url: body.photo_url,
      rcc: body.tax_payer_type === "Company" ? body.rcc : "",
      bvn: body.bvn,
      nin: body.nin,
    });

    return {
      status: true,
      message: "Tax Payer Created Successfully!",
    };
  }

  async findAll(query) {
    console.log({query})
    let perPage = 10; // number of records per page
    var page = query.page || 1;
    let offset = perPage * page - perPage;

    const conditions = {
      service_id: query.service_id, // Always include service_id
      [Op.and]: [
        query.taxpayer_name ? { taxpayer_name: query.taxpayer_name } : null,
        query.tax_payer_type ? { tax_payer_type: query.tax_payer_type } : null,
        query.query_params && {
          [Op.or]: [
            query.query_params ? { mobile_number: query.query_params } : null,
            query.query_params ? { taxpayer_tin: query.query_params } : null,
            query.query_params ? { email_addresss: query.query_params } : null,
          ].filter(Boolean), // Filter out null conditions
        },
      ].filter(Boolean), // Filter out empty or null conditions
    };
    console.log(conditions)
    
    // Query using filtered conditions
    const [results, count] = await Promise.all([
      this.tax_payers.findAll({
        where: conditions,
        limit: perPage,
        offset: offset,
        raw: true,
      }),
      this.tax_payers.count({
        where: conditions,
      }),
    ]);
    


    return {
      results,
      count,
    };
  }

  async findOne(id) {
    return await this.tax_payers.findByPk(taxpayer_id, { raw: true });
  }
}

module.exports = new Taxpayer();
