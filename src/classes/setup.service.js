const input = require("../lib/input_validation");
const Lgas = require("../model/LGA");
const Revenue_item = require("../model/Revenue_item");
const State = require("../model/State");
const db = require("../db/connection");
const { Sequelize, QueryTypes, Op } = require("sequelize");
const { groupBy } = require("../helper/helper");
const Wards = require("../model/Ward");
const Streets = require("../model/Street");
const Areas = require("../model/Area");
class Setup {
  constructor() {
    this.revenue_item = Revenue_item;
    this.inputValidation = input;
    this.states = State;
    this.lgas = Lgas;
    this.wards = Wards;
    this.streets = Streets;
    this.db = db;
    this.areas = Areas;
  }

  validation(body) {
    const { value, error } = this.inputValidation.validateItem.validate(body);
    if (error) throw Error(error.message);
    return value;
  }

  async addItem(data, service_id) {
    // console.log({ data });
    const value = this.validation(data);
    if (value) {
      await this.revenue_item.create({
        code: value.revenue_line == "Ticket" ? 11111111 : 232233322,
        revenue_line: value.revenue_line,
        item_code: value.item_code,
        timeline: value.timeline,
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

  async lga(query) {
    // console.log(query);
    const conditions = [];

    if (query.service_type === "State") {
      conditions.push({ state_id: query.state.split(",")[0] });
    } else {
      conditions.push({ lga_id: query.lga.split(",")[0] });
    }

    return await this.lgas.findAll({
      where: {
        [Op.and]: conditions,
      },
      raw: true,
    });
  }

  async ward(user) {
    // console.log(user);

    // Fetch LGAs based on the user input
    const result = await this.lga(user);
    const lgaIds = result.map((item) => item.lga_id);
    const lga_id = user.lga ? user.lga.split(",")[0] : null;

    // Condition for "State" service type
    if (user.service_type === "State") {
      if (user.group_id === 111) {
        // Fetch all wards and corresponding LGAs
        const wards = await this.db.query(
          `
          SELECT 
            areas.area_code,
            areas.areaname,
            _lga.lga
          FROM areas
          INNER JOIN _lga ON _lga.lga_id = areas.lga_id
          `,
          {
            type: QueryTypes.SELECT,
          }
        );

        const localGovrts = await this.lgas.findAll({
          where: { lga_id: lgaIds },
          raw: true,
        });

        return {
          wards,
          localGovrt: localGovrts,
        };
      } else {
        // Fetch wards filtered by LGA IDs
        const wards = await this.db.query(
          `
          SELECT 
            areas.area_code,
            areas.areaname,
            _lga.lga
          FROM areas
          INNER JOIN _lga ON _lga.lga_id = areas.lga_id
          WHERE areas.lga_id IN (${lgaIds.map(() => "?").join(",")})
          `,
          {
            type: QueryTypes.SELECT,
            replacements: lgaIds,
          }
        );

        const localGovrts = await this.lgas.findAll({ raw: true });

        return {
          wards,
          localGovrt: localGovrts,
        };
      }
    } else {
      // Condition for non-"State" service type
      if (user.group_id === 111) {
        // Fetch all wards and corresponding LGAs
        const wards = await this.db.query(
          `
          SELECT 
            areas.area_code,
            areas.areaname,
            _lga.lga
          FROM areas
          INNER JOIN _lga ON _lga.lga_id = areas.lga_id
          `,
          {
            type: QueryTypes.SELECT,
          }
        );

        const localGovrts = await this.lgas.findAll({ raw: true });

        const selectedLga = localGovrts.find((lga) => lga.lga_id === lga_id);
        return {
          wards,
          localGovrt: selectedLga,
        };
      } else {
        // Fetch wards filtered by a single LGA ID
        const wards = await this.db.query(
          `
          SELECT 
            areas.area_code,
            areas.areaname,
            _lga.lga
          FROM areas
          INNER JOIN _lga ON _lga.lga_id = areas.lga_id
          WHERE areas.lga_id = :lga_id
          `,
          {
            type: QueryTypes.SELECT,
            replacements: { lga_id },
          }
        );

        const localGovrts = await this.lgas.findAll({ raw: true });

        const selectedLga = localGovrts.find((lga) => lga.lga_id === lga_id);
        return {
          wards,
          localGovrt: selectedLga,
        };
      }
    }
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
    const streets = await this.streets.findAll({
      attributes: [["idstreet", "id"], "street"],
      where: { city_id: query.ward_id },
      raw: true,
    });
    console.log(streets);
    return {
      status: true,
      data: streets,
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
