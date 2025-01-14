const input = require("../lib/input_validation");
const Lgas = require("../model/LGA");
const Revenue_item = require("../model/Revenue_item");
const State = require("../model/State");
const db = require("../db/connection");
const { Sequelize, QueryTypes } = require("sequelize");
const { groupBy } = require("../helper/helper");
const Wards = require("../model/Ward");
const Streets = require("../model/Street");

class Setup {
  constructor() {
    this.revenue_item = Revenue_item;
    this.inputValidation = input;
    this.states = State;
    this.lgas = Lgas;
    this.wards = Wards;
    this.streets = Streets;
    this.db = db;
  }

  validation(body) {
    const { value, error } = this.inputValidation.validateItem.validate(body);
    if (error) throw Error(error.message);
    return value;
  }

  async addItem(data, service_id) {
    const value = this.validation(data);
    if (value) {
      await this.revenue_item.create({
        code: value.revenue_line == "Ticket" ? 11111111 : 232233322,
        revenue_line: value.revenue_line,
        item_code: value.timeline,
        revenue_item: value.name,
        amount: value.Amount,
        service_id: service_id,
        // rate_year: value.rate_year
      });

      return {
        status: true,
        message: "Item added",
      };
    }
  }
  async editItem(id, data) {
    const item = await this.revenue_item.findByPk(id);
    if (!item) throw new Error("Item not found");

    await item.update({
      revenue_line: data.revenue_line,
      item_code: data.timeline,
      revenue_item: data.name,
      amount: data.amount,
    });
    return {
      status: true,
      message: "Item updated",
    };
  }

  async deleteItem(id) {
    const item = await this.revenue_item.findByPk(id);
    if (!item) throw new Error("Item not found");

    await item.destroy();

    return {
      status: true,
      message: "Item deleted",
    };
  }

  async Items(query) {
    const { count, rows } = await this.revenue_item.findAndCountAll();
    return {
      count,
      rows,
    };
  }

  // State method
  async state() {
    return await this.states.findAll({ raw: true });
  }

  async lga(id) {
    return await this.lgas.findAll({
      where: { state_id: id.state_id },
      raw: true,
    });
  }

  async ward(query) {
    const wards = await this.db.query(
      `
            SELECT 	
                _cities.city_id,
                _cities.city,
                _lga.lga 
            FROM  _cities INNER JOIN _lga ON _lga.lga_id = _cities.lga_id`,
      { type: QueryTypes.SELECT }
    );
    const localGovrt = await this.lgas.findAll({ raw: true });
    return {
      wards: groupBy(wards, "lga"),
      localGovrt,
    };
  }

  async createWard(data, service_id) {
    await this.wards.create({
      city: data.ward,
      lga_id: data.lga,
      created_at: new Date(),
      service_id: service_id,
    });

    return {
      status: true,
      message: "Created",
    };
  }

  async editWard(id, data) {
    const ward = await this.wards.findByPk(id);
    if (!ward) throw new Error("Ward not found");

    await ward.update({
      city: data.ward,
      lga_id: data.lga,
      updated_at: new Date(),
    });

    return {
      status: true,
      message: "Ward updated",
    };
  }

  async deleteWard(id) {
    const ward = await this.wards.findByPk(id);
    if (!ward) throw new Error("Ward not found");

    await ward.destroy();

    return {
      status: true,
      message: "Ward deleted",
    };
  }

  async AllStreets(query) {
    const wads = await this.wards.findAll({ raw: true });
    const streets = await this.db.query(
      `
             SELECT 	
                s.idstreet,
                s.street,
                c.city 
            FROM  _streets as s INNER JOIN _cities as c ON c.city_id = s.city_id
            `,
      { type: QueryTypes.SELECT }
    );
    return {
      wads,
      streets: groupBy(streets, "city"),
    };
  }

  async findStreet(query) {
    const streets = await this.streets.findAll({ attributes: [["idstreet", "id"], "street"], where: { city_id: query.ward_id }, raw: true});
    console.log(streets)
    return {
      status: true,
      data: streets
    };
  }

  async createStreet(data, service_id) {
    await this.streets.create({
      street: data.street,
      city_id: data.ward,
      service_id: service_id,
    });

    return {
      status: true,
      message: "Created",
    };
  }
}

module.exports = Setup;
