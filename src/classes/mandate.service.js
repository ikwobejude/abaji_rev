const { Op } = require("sequelize");
const sequelize = require("../db/connection");
const { building } = require("../model/Buildings");
const { businesses } = require("../model/business.model");
const Revenue_item = require("../model/Revenue_item");

class Mandates {
    constructor(){
        this.db = sequelize
        this.business = businesses;
        this.building = building;
        this.revenue_items = Revenue_item
    }

    async generateMandate(query) {
        if(query.mandate_type == "Buildings") {
            const response = await this.generateForBuildings(query)
            return response
        } else if(query.mandate_type == "Business") {
            const response = await this.generateForBusiness(query)
            return response
        } else {
            const t = await this.db.transaction();
            try {
                await this.generateForBuildings(t, "Building", "all")
                await this.generateForBusiness(t, "Business", "all")

                await t.commit()
            } catch (error) {
                await t.rollback()
            }
        }
    }

    async generateForBusiness() {
        
    }

    async generateForBuildings(query) {
        const buildings = await this.building.findAll({
            where: {
                
                [Op.and]: [
                    query.ward && { ward: query.ward },
                    query.street && { ward: query.street_id },
                ]
            },
            raw: true
        })

        if(!buildings) throw Error("No building found")

        for (const building of buildings) {
            const items = building.item_codes.split(',')
            items.map(Xasync (item) => {
                const assItmes = await this.revenue_items.findOne({ where: {id: item}, raw: true})
            })
        }


    }

    

}