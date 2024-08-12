const input = require("../lib/input_validation");
const Lgas = require("../model/LGA");
const Revenue_item = require("../model/Revenue_item");
const State = require("../model/State");
const db = require('../db/connection');
const { Sequelize, QueryTypes } = require("sequelize");
const { groupBy } = require("../helper/helper");
const Wards = require("../model/Ward");
const Streets = require("../model/Street");

class Setup {
    constructor(){
        this.revenue_item = Revenue_item
        this.inputValidation = input
        this.states = State
        this.lgas = Lgas
        this.wards = Wards
        this.streets = Streets
        this.db = db
    }

    validation(body) {
        const {value, error} = this.inputValidation.validateItem.validate(body);
        if(error) throw Error(error.message)
            return value
    }

    async addItem(data, service_id) {
        const value = this.validation(data);
        if(value) {
            await this.revenue_item.create({
                code: value.revenue_line == "Ticket" ? 11111111 : 232233322  ,
                revenue_line: value.revenue_line,
                item_code: value.timeline,
                revenue_item: value.name,
                amount: value.Amount,
                service_id: service_id,
                // rate_year: value.rate_year
            })

            return {
                status: true,
                message: "Item added"
            }
        }

    }

    async Items(query) {
        const { count, rows }  = await this.revenue_item.findAndCountAll();
        return {
            count, 
            rows
        }
    }

    // State method
    async state(query) {
        return await this.states.findAll({ raw: true });
    }

    async lga(query) {
        return await this.lgas.findAll({ raw: true });
    }

    async ward(query) {
        const wards = await this.db.query(`
            SELECT 	
                _cities.city_id,
                _cities.city,
                _lga.lga 
            FROM  _cities INNER JOIN _lga ON _lga.lga_id = _cities.lga_id`,
        {type: QueryTypes.SELECT});
        console.log(groupBy(wards, "lga"))
        const localGovrt = await this.lgas.findAll({raw: true})
        return {
            wards: groupBy(wards, "lga"),
            localGovrt
        }
    }

    async createWard(data, service_id) {
        await this.wards.create({
            city: data.ward,
            lga_id: data.lga,
            created_at: new Date(),
            service_id: service_id
        })

        return {
            status: true,
            message: "Created"
        }
    }


    async AllStreets(query) {
        const wads = await this.wards.findAll({ raw: true });
        const streets = await this.db.query(`
             SELECT 	
                s.idstreet,
                s.street,
                c.city 
            FROM  _streets as s INNER JOIN _cities as c ON c.city_id = s.city_id
            `, {type: QueryTypes.SELECT})
        return {
            wads,
            streets: groupBy(streets, "city")
        }
    }

    async createStreet(data, service_id) {
        await this.streets.create({
            street: data.street,
            city_id: data.ward,
            service_id: service_id
        })

        return {
            status: true,
            message: "Created"
        }
    }
}

module.exports = Setup