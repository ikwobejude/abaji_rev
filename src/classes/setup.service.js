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
const OnboardingStep = require('../model/Onboarding_Step')
const Users = require('../model/Users')
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
    this.onboarding = OnboardingStep;
    this.user = Users
  }

  validation(body) {
    const { value, error } = this.inputValidation.validateItem.validate(body);
    if (error) throw Error(error.message);
    return value;
  }
  async endOnboarding(user_id) {
    await this.users.update({
      ended_onboarding: true
    }, { where: { id: user_id } })
  }
  async addItem(data, service_id, user_id) {
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
      console.log(user_id)
      const user = await this.user.findByPk(user_id);

      if (user) {
        let newAuthStep = user.authStep;

        // If authStep is 1, increment it by 1
        if (user.authStep === 1) {
          newAuthStep += 1;
        }
        // Update authStep
        await this.user.update({ authStep: newAuthStep }, { where: { id: user_id } });
      }

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
      item_code: data.item_code,
      timeline: data.timeline,
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
    const conditions = [];
    //  console.log({query})

    if (query.state_id) {
      conditions.push({ state_id: query.state_id });
    }

    if (query.lga && query.lga.trim() !== "") {
      conditions.push({ lga_id: query.lga.split(",")[0] });
    }

    if (query.state && !query.lga) {
      return await this.lgas.findAll({
        where: { state_id: query.state },
        raw: true,
      });
    }

    if (conditions.length === 0) {
      throw new Error("State or LGA parameter is missing");
    }

    return await this.lgas.findAll({
      where: {
        [Op.and]: conditions,
      },
      raw: true,
    });
  }



  async ward(user) {
    try {
      // Fetch LGAs based on user input
      const result = await this.lga(user);
      const lgaIds = result.map((item) => item.lga_id);
      const lga_id = user.lga ? user.lga.split(",")[0] : null;
  
      let wards = [];
      let localGovrts = [];
  
      if (user.service_type === "State") {
        if (user.group_id === 111111) {
          wards = await this.db.query(
            `
            SELECT _cities.city_id, _cities.city, _lga.lga
            FROM _cities
            INNER JOIN _lga ON _lga.lga_id = _cities.lga_id
            `,
            { type: QueryTypes.SELECT }
          );
  
          localGovrts = await this.lgas.findAll({
            where: { lga_id: lgaIds },
            raw: true,
          });
        } else {
          wards = await this.db.query(
            `
            SELECT _cities.city_id, _cities.city, _lga.lga
            FROM _cities
            INNER JOIN _lga ON _lga.lga_id = _cities.lga_id
            WHERE _cities.lga_id IN (${lgaIds.map(() => "?").join(",")})
            `,
            { type: QueryTypes.SELECT, replacements: lgaIds }
          );
  
          localGovrts = await this.lgas.findAll({ raw: true });
        }
      } else {
        if (user.group_id === 111111) {
          wards = await this.db.query(
            `
            SELECT _cities.city_id, _cities.city, _lga.lga
            FROM _cities
            INNER JOIN _lga ON _lga.lga_id = _cities.lga_id
            `,
            { type: QueryTypes.SELECT }
          );
  
          localGovrts = await this.lgas.findAll({ raw: true });
        } else {
          wards = await this.db.query(
            `
            SELECT _cities.city_id, _cities.city, _lga.lga
            FROM _cities
            INNER JOIN _lga ON _lga.lga_id = _cities.lga_id
            WHERE _cities.lga_id IN (${lgaIds.map(() => "?").join(",")})
            `,
            { type: QueryTypes.SELECT, replacements: lgaIds }
          );
        }
      }
      const filteredLgas = localGovrts.filter((lga) => lga.lga_id == lga_id);

      return {
        wards,
        lgas: filteredLgas,
        selectedLga: localGovrts.find((lga) => lga.lga_id == lga_id) || null,
      };
    } catch (error) {
      console.error("Error in ward function:", error);
      throw error;
    }
  }
  
  
  async createWard(data, service_id) {
    const wardsArray = data.ward.split(",").map(ward => ward.trim()); 
  
    const wardRecords = wardsArray.map(ward => ({
      city: ward,
      lga_id: data.lga,
      created_at: new Date(),
      service_id: service_id,
    }));
  
    await this.wards.bulkCreate(wardRecords); 
  
    return {
      status: true,
      message: `${wardsArray.length} Wards Created`,
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
    const ward = await this.wards.findOne({city_id: id});
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

  async createStreet(data, service_id, user_id) {
    await this.streets.create({
      street: data.street,
      city_id: data.ward,
      service_id: service_id,
    });
    const user = await this.user.findOne({ where: { id: user_id } });
    if (user) {
      let newAuthStep = user.authStep;

      if (user.authStep === 2) {
        newAuthStep += 1;
      }
      await this.user.update({ authStep: newAuthStep }, { where: { id: user_id } });
    }
    return {
      status: true,
      message: "Created",
    };
  }
  async fetchSteps() {
    return await this.onboarding.findAll({
      raw: true
    })
  }
}

module.exports = Setup;
