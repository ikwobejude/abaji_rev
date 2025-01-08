const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs");
const eventEmitter = require('events');
const { business_categories, business_operations, business_sectors, business_sizes, business_types, businesses } = require('../model/business.model')
const sequelize = require('../db/connection');
const { QueryTypes } = require('sequelize');
const { query } = require("express");

const emitter = new eventEmitter();

require('../events/validation/schema')(emitter)

class Business {
    constructor(){
        this.db = sequelize
     }

    // get building categories
    async _business_categories(query) {
        return await business_categories.findAll({
            attributes: [["business_category", "name"], ["business_category_id", "id"]],
            raw: true
        })
    }

    // add categories
    async add_business_category(data) {

        emitter.emit('before_building_categories', data)
        const category = data.business_category?.split(',')

        let arr = [];

        category.map(cat => {
            arr.push({ business_category: cat });
        })

        await business_categories.bulkCreate(arr)
        return {
            status: true,
            message: "Created!"
        }

    }

    // edit category
    async edit_business_category(data) {

        emitter.emit('before_building_categories', data)
        const category = data.category
        await business_categories.update(
            {business_category: category}, 
            { where: { business_category_id: data.id } }
        );
        return {
            status: true,
            message: "Created!"
        }

    }

    async _delete_business_category(id) {
        await business_categories.destroy({ where: { business_category_id: id } })
        return {
            status: true,
            message: "Deleted"
        }
    }

    // Business operation
    async _business_operation(query) {
        return await business_operations.findAll({
            attributes: [["business_operation", "name"], ["business_operation_id", "id"]],
            raw: true
        })
    }

    // add
    async add_business_operation(data) {

        emitter.emit('before_building_operation', data)
        const operations = data?.business_operation?.split(',')

        let arr = [];

        operations.map(cat => {
            arr.push({ business_operation: cat });
        })

        await business_operations.bulkCreate(arr)
        return {
            status: true,
            message: "Created!"
        }

    }

    async edit_business_operation(data) {
        emitter.emit('before_building_operation', data)
        const operation = data.operation
        await business_operations.update(
            {business_operation: operation}, 
            { where: { business_operation_id: data.id } }
        );
        return {
            status: true,
            message: "Created!"
        }

    }

    async _delete_business_operations(id) {
        await business_categories.destroy({ where: { business_operation_id: id } })
        return {
            status: true,
            message: "Deleted"
        }
    }


    // Business sector
    async _business_sector(query) {
        return await business_sectors.findAll({
            attributes: [["business_sector", "name"], ["business_sector_id", "id"]],
            raw: true
        })
    }

    async add_business_sector(data) {

        emitter.emit('before_building_sector', data)
        const business_sector = data.sector?.split(',')

        let arr = [];

        business_sectors.map(cat => {
            arr.push({ business_operation: cat });
        })

        await business_sectors.bulkCreate(arr)
        return {
            status: true,
            message: "Created!"
        }

    }

    async edit_business_sector(data) {
        emitter.emit('before_building_sector', data)
        const sector = data.sector
        await business_sectors.update(
            {business_sector: sector}, 
            { where: { business_sector_id: data.id } }
        );
        return {
            status: true,
            message: "Created!"
        }

    }

    async _delete_business_sector(id) {
        await business_sectors.destroy({ where: { business_sector_id: id } })
        return {
            status: true,
            message: "Deleted"
        }
    }

    // Business sector
    async _business_sizes(query) {
        return await business_sizes.findAll({
            attributes: [["business_size", "name"], ["business_size_id", "id"]],
            raw: true
        })
    }

    async add_business_sizes(data) {

        emitter.emit('before_building_sizes', data)
        const business_size = data.sizes?.split(',')

        let arr = [];

        business_size.map(cat => {
            arr.push({ business_size: cat });
        })

        await business_sizes.bulkCreate(arr)
        return {
            status: true,
            message: "Created!"
        }

    }

    async edit_business_sizes(data) {
        emitter.emit('before_building_sizes', data)
        const sector = data.sizes
        await business_sizes.update(
            {business_size: sector}, 
            { where: { business_sector_id: data.id } }
        );
        return {
            status: true,
            message: "Created!"
        }

    }

    async _delete_business_sizes(id) {
        await business_sizes.destroy({ where: { business_size_id: id } })
        return {
            status: true,
            message: "Deleted"
        }
    }

    // Business Sizes
    async _business_sizes(query) {
        return await business_sizes.findAll({
            attributes: [["business_size", "name"], ["business_size_id", "id"]],
            raw: true
        })
    }

    async add_business_sizes(data) {

        emitter.emit('before_building_sizes', data)
        const business_size = data.sizes?.split(',')

        let arr = [];

        business_size.map(cat => {
            arr.push({ business_size: cat });
        })

        await business_sizes.bulkCreate(arr)
        return {
            status: true,
            message: "Created!"
        }

    }

    async edit_business_sizes(data) {
        emitter.emit('before_building_sizes', data)
        const sector = data.sizes
        await business_sizes.update(
            {business_size: sector}, 
            { where: { business_sector_id: data.id } }
        );
        return {
            status: true,
            message: "Created!"
        }

    }

    async _delete_business_sizes(id) {
        await business_sizes.destroy({ where: { business_size_id: id } })
        return {
            status: true,
            message: "Deleted"
        }
    }

    // Business Sizes
    async _business_type(query) {
        return await business_types.findAll({
            attributes: [["business_type", "name"], ["idbusiness_type", "id"]],
            raw: true
        })
    }

    async add_business_types(data) {
        // console.log(data)

        emitter.emit('before_building_types', data)
        const types = data.business_type?.split(',')

        let arr = [];

        types.map(cat => {
            arr.push({ business_type: cat.trim() });
        })

        await business_types.bulkCreate(arr)
        return {
            status: true,
            message: "Created!"
        }

    }

    async edit_business_types(data) {
        emitter.emit('before_building_types', data)
        const type = data.types
        await business_types.update(
            { business_type: type }, 
            { where: { idbusiness_type: data.id } }
        );
        return {
            status: true,
            message: "uPDATED!"
        }

    }

    async _delete_business_types(id) {
        await business_sizes.destroy({ where: { idbusiness_type: id } })
        return {
            status: true,
            message: "Deleted"
        }
    }

    async createBusiness(data, user) {
            const res1 = new Promise((resolve, reject) => {
                //worker begins here
                const worker = new Worker(
                  path.join(__dirname, `../worker/sync_business.worker.js`),
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


    async getAllBusiness(query) {
        try {
            const perPage = 10;
            const page = parseInt(query.page, 10) || 1;
            const offset = perPage * (page - 1);
    
            let sql = `
            SELECT 
                businesses.business_name, 
                businesses.business_address,  
                businesses.businessnumber,  
                businesses.contact_person,  
                businesses.business_tag,
                _business_categories.business_category, 
                _business_operations.business_operation, 
                _business_sectors.business_sector, 
                _business_sizes.business_size, 
                _business_types.business_type,
                _buildings.building_name, 
                _buildings.street_id, 
                businesses.created_at
            FROM businesses 
            LEFT JOIN _business_categories ON businesses.business_category = _business_categories.business_category_id
            LEFT JOIN _business_operations ON businesses.business_operation = _business_operations.business_operation_id
            LEFT JOIN _business_sectors ON businesses.business_sector = _business_sectors.business_sector_id
            LEFT JOIN _business_sizes ON businesses.business_size = _business_sizes.business_size_id
            LEFT JOIN _business_types ON businesses.business_type = _business_types.idbusiness_type
            LEFT JOIN _buildings ON _buildings.building_id = businesses.building_id
            WHERE businesses.service_id = :service_id
            `;
    
            if (query.business_name) {
                sql += ` AND (businesses.business_name LIKE :business_name OR businesses.businessnumber LIKE :business_name)`;
            }
            if (query.business_size) {
                sql += ` AND businesses.business_size LIKE :business_size`;
            }
            if (query.business_category) {
                sql += ` AND businesses.business_category LIKE :business_category`;
            }
            if (query.from && query.to) {
                sql += ` AND DATE(businesses.created_at) BETWEEN :from AND :to`;
            } else if (query.from) {
                sql += ` AND DATE(businesses.created_at) = :from`;
            }
    
            sql += ` ORDER BY businesses.business_id DESC LIMIT :limit OFFSET :offset`;
    
            const [businesses, businessCount] = await Promise.all([
                this.db.query(sql, {
                    replacements: {
                        service_id: query.service_id,
                        business_name: `%${query.business_name || ""}%`,
                        business_size: `%${query.business_size || ""}%`,
                        business_category: `%${query.business_category || ""}%`,
                        from: query.from || null,
                        to: query.to || null,
                        limit: perPage,
                        offset,
                    },
                    type: QueryTypes.SELECT,
                }),
                this.db.query(
                    `SELECT COUNT(*) AS count FROM businesses WHERE service_id = :service_id`,
                    { replacements: { service_id: query.service_id }, type: QueryTypes.SELECT }
                ),
            ]);
    
            const businessTypes = await business_types.findAll({ raw: true });
            const businessCategories = await business_categories.findAll({ raw: true });
            const businessOperations = await business_operations.findAll({ raw: true });
            const businessSectors = await business_sectors.findAll({ raw: true });
            const businessSizes = await business_sizes.findAll({ raw: true });
    
            return {
                businesses,
                businessCategories,
                businessTypes,
                businessOperations,
                businessSectors,
                businessSizes,
                current: page,
                pages: Math.ceil(businessCount[0].count / perPage),
            };
    
        } catch (error) {
            console.error("Error fetching businesses:", error);
            throw Error(error.message);
        }
    }
    
   
}

module.exports = new Business()