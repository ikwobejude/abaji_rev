const eventEmitter = require('events');
const { Worker } = require("worker_threads");
const path = require("path");
const sequelize = require('../db/connection');
const { QueryTypes } = require('sequelize');
const { building, building_categories, building_types } = require('../model/Buildings');
const Areas = require('../model/location.model');
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
              path.join(__dirname, `../../worker/sync_buildings.worker.js`),
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

    async getAllBuildings(query) {
        try {
            const perPage = 20; // Number of records per page
            const page = parseInt(query.page, 10) || 1; // Current page (default to 1 if not provided)
            const offset = perPage * (page - 1);
        
        
            // Base SQL query
            let sql = `
            SELECT 
                _buildings.building_number, 
                _buildings.building_id,
                _buildings.building_name, 
                _buildings.owner_name, 
                _buildings.owner_email, 
                _buildings.owner_mobile_no,
                _building_categories.building_category,  
                _building_types.building_type,
                _states.state,
                _lga.lga, 
                _streets.street, 
                areas.areaname AS city  
            FROM _buildings 
            LEFT JOIN _building_categories ON _building_categories.idbuilding_category = _buildings.building_category_id
            LEFT JOIN _building_types ON _building_types.idbuilding_types = _buildings.apartment_type
            LEFT JOIN _streets ON _streets.idstreet = _buildings.ward
             LEFT JOIN areas ON areas.Id = _buildings.ward
            LEFT JOIN _lga ON _lga.lga_id = _buildings.lga
            LEFT JOIN _states ON _states.state_id = _buildings.state_id
            WHERE _buildings.service_id = :service_id
            `;
        
            // Apply filters based on query parameters
            if (query.ward) {
              sql += ` AND _buildings.ward = :ward`;
            }
        
            if (query.street) {
              sql += ` AND _buildings.street_id = :street`;
            }
        
            if (query.from && query.to) {
                sql += ` AND DATE(_buildings.registered_on) BETWEEN :from AND :to`;
            } else if (query.from) {
                sql += ` AND DATE(_buildings.registered_on) = :from`;
            }
        
            if (query.searchValue) {
            sql += `
                AND (
                _buildings.building_name LIKE :searchValue
                OR _buildings.owner_email LIKE :searchValue
                OR _buildings.owner_mobile_no LIKE :searchValue
                )
            `;
            }
        
            // Apply ordering and pagination
            sql += ` ORDER BY _buildings.idbuilding DESC`;
            if (query.search !== "1") {
            sql += ` LIMIT :limit OFFSET :offset`;
            }
        
            // Execute the query with replacements
            const [ result, count, wards] = await Promise.all([
                await this.db.query(sql, {
                    replacements: {
                        service_id: query.service_id,
                        ward: query.ward,
                        street: query.street,
                        from: query.from,
                        to: query.to,
                        limit: perPage,
                        offset,
                        searchValue: `%${query.searchValue || ""}%`,
                    },
                    type: QueryTypes.SELECT,
                }),
                await building.count({
                    where: { service_id: query.service_id },
                }),

                await Areas.findAll({
                    where: { service_id: query.service_id },
                })
            ])
            
            // Render the view with results
            return {
                current: page,
                pages: Math.ceil(count / perPage),
                buildings: result,
                page_title: "Buildings",
                wards,
                search: query.search || 0,
            }
        } catch (error) {
            console.error(error)
            throw new Error(error)
        }
    }
          
    
}

module.exports = new Buildings()