const eventEmitter = require('events');
const sequelize = require('../db/connection');
const { QueryTypes } = require('sequelize');
const { building, building_categories, building_types } = require('../model/Buildings')
const emitter = new eventEmitter();

require('../events/validation/schema')(emitter)

class Buildings {
    constructor(){
        this.db = sequelize
     }

    // get building categories
    async _building_categories(query) {
        return await building_categories.findAll({
            attributes: [["building_category", "name"], ["idbuilding_category", "id"]],
            raw: true
        })
    }

    // add categories
    async add_building_category(data) {
        console.log(data)
        emitter.emit('before_creating_building_categories', data)
        const category = data.categories?.split(',')

        let arr = [];

        category.map(cat => {
            arr.push({
                building_category: cat
            });
        })

        await building_categories.bulkCreate(arr)
        return {
            status: true,
            message: "Created!"
        }
    }

    // edit category
    async edit_building_category(data) {
        emitter.emit('before_creating_building_categories', data)
        const category = data.category
        await building_categories.update({building_category: category}, { where: { idbuilding_category: data.id } });
        return {
            status: true,
            message: "Created1"
        }
    }


    // get building types
    async allBuildingType() {
        return await this.db.query(`
            SELECT 
                bdt.idbuilding_types,
                bdt.building_type,
                bdt.category,
                bdc.building_category,
                bdc.idbuilding_category
            FROM _building_types AS bdt 
            INNER JOIN _building_categories AS bdc ON bdc.idbuilding_category = bdt.category`, 
        {
            type: QueryTypes.SELECT
        })
    }
    
    // add building type
    async addBuildingType(data) {
        // console.log(data);
        emitter.emit('before_create_building_type', data)
        const type = data.type.split(',')

        let arr = [];

        type.map(type => {
            arr.push({
                building_type: type.trim(),
                category: parseInt(data.category)
            })
        })
        // console.log(arr)

        await building_types.bulkCreate(arr);
        return {
            status: true,
            message: "Created1"
        }
    }

    // edit building type
    async editBuildingType(data) {
        emitter.emit('before_create_building_type', data)
        const building_type = data.building_type,
        category = data.category
        await building_type.update({
            building_type,
            category
        }, { where: { idbuilding_types: data.id }});
        return {
            status: true,
            message: "Created1"
        }
    }
    
    async createBuildings(data, user) {
        const res1 = new Promise((resolve, reject) => {
            //worker begins here
            const worker = new Worker(
              path.join(__dirname, `../worker/sync_buildings.worker.js`),
              {
                workerData: {
                  data,
                  user,
                },
              }
            );
      
            worker.on("message", (data) => {
              resolve(data);
              return data;
            });
      
            worker.on("error", (error) => {
              // console.log({ error });
              reject(error);
              throw Error(error.message);
            });
      
            worker.on("exit", (code) => {
              if (code !== 0)
                throw Error(`Worker has stopped working with exit code ${code}`);
            });
          });
      
          return res1;
    }
}

module.exports = new Buildings()