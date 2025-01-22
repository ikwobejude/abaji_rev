const { Op, QueryTypes } = require("sequelize");
const sequelize = require("../db/connection");
const { building } = require("../model/Buildings");
const { businesses } = require("../model/business.model");
const Revenue_item = require("../model/Revenue_item");
const Revenues_invoices = require("../model/Revenue_invoice");
const Tax_items = require("../model/Tax_items");

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
        } 
    }

    async generateForBusiness(query) {
        try {
            let sql = `
            SELECT 
                b.* 
            FROM businesses AS b
            INNER JOIN _buildings AS bul 
                ON bul.building_number = b.building_id OR bul.building_id = b.building_id
            WHERE b.service_id = :service_id
        `;
        
        // Add conditional filters based on query
        if (query.ward && query.ward !== "All") {
            sql += ` AND bul.ward = :ward`;
        }
        if (query.street_id) {
            sql += ` AND bul.street_id = :street_id`;
        }
        
        try {
            // Execute query with relevant replacements
            const replacements = {
                service_id: query.service_id,
                ...(query.ward && query.ward !== "All" ? { ward: query.ward } : {}),
                ...(query.street_id ? { street_id: query.street_id } : {})
            };
        
            const businesses = await this.db.query(sql, {
                replacements,
                type: QueryTypes.SELECT
            });
        
            return businesses;
        } catch (error) {
            console.error("Error fetching businesses:", error);
            throw error;
        }
        
            // console.log(businesses)

            if (!businesses || businesses.length === 0) throw new Error("No building found");

            const businessPayload = [];
            const assessmentItems = [];

            for (const business of businesses) {
                const items = business.tax_item_codes.split(',');
                const batchNumber = new Date().getTime().toString(36);
                const invoiceNumber = `INV-${Math.random().toString(36).substr(2, 9)}`
                let totalSum = 0;
        
                // Fetch all items for the current building
                const assItems = await this.revenue_items.findAll({
                    where: { item_code: items },
                    raw: true,
                });
        
                for (const item of assItems) {
                    totalSum += parseFloat(item.amount); // Accumulate the total amount
                    assessmentItems.push({
                        idtax: new Date().getTime().toString(36),
                        taxitem: item.revenue_item,
                        amount: item.amount,
                        business_tag: business.business_tag,
                        taxyear: new Date().getFullYear(),
                        revenue_code: item.revenue_code, // Adjust if this is an array or undefined
                        invoice_number: invoiceNumber, // Generate unique invoice number
                        revenue_code: item.item_code,
                        type: "Revenue Business",
                        service_id: business.service_id,
                        batch: batchNumber,
                    });
                }

                // console.log(totalSum)

                businessPayload.push({
                    ref_no: new Date().getTime().toString(36),
                    tin: business.profile_ref,
                    taxpayer_name: business.business_ownership,
                    revenue_id: business.business_name,
                    description: business.business_name,
                    amount: totalSum,
                    day: new Date().getDate(),
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    entered_by: query.username,
                    invoice_number: invoiceNumber, // Generate unique invoice number
                    source: "Business",
                    business_tag: business.business_tag,
                    AmountDue: totalSum,
                    batch: batchNumber,
                    service_id: query.service_id
                })
            }

            const t = await this.db.transaction();
            try {
                const createdRevenues = await Revenues_invoices.bulkCreate(businessPayload, 
                    { transaction: t, returning: true, });
                await Tax_items.bulkCreate(assessmentItems, {
                    updateOnDuplicate: [
                        "taxitem",
                        "amount",
                        "business_tag",
                        "taxyear",
                        "revenue_code",
                        "invoice_number",
                        "type",
                    ],
                    transaction: t,
                });
                await t.commit();
                return {
                    status: true,
                    message: `Generated ${createdRevenues.length} invoice${createdRevenues.length > 1 ? 's': ''}`,
                }
            } catch (error) {
                await t.rollback();
                throw new Error(`Transaction failed: ${error.message}`);
            }

        } catch (error) {
            console.log(error)
            throw new Error(error.message);
        }
    }

    async generateForBuildings(query) {
        try {
            const buildings = await this.building.findAll({
                where: {
                    service_id: query.service_id,
                    [Op.and]: [
                        (query.ward && query.ward !== "All") && { ward: query.ward },
                        query.street && { ward: query.street_id },
                    ],
                },
                raw: true,
            });
        
            if (!buildings || buildings.length === 0) throw new Error("No building found");
        
            const buildingPayload = [];
            const assessmentItems = [];
        
            for (const building of buildings) {
                const items = building.item_codes.split(',');
                const batchNumber = new Date().getTime().toString(36);
                const invoiceNumber = `INV-${Math.random().toString(36).substr(2, 9)}`
                let totalSum = 0;
        
                // Fetch all items for the current building
                const assItems = await this.revenue_items.findAll({
                    where: { item_code: items },
                    raw: true,
                });
        
                for (const item of assItems) {
                    totalSum += item.amount; // Accumulate the total amount
                    assessmentItems.push({
                        idtax: new Date().getTime().toString(36),
                        taxitem: item.revenue_item,
                        amount: item.amount,
                        business_tag: building.building_tag,
                        taxyear: new Date().getFullYear(),
                        revenue_code: item.revenue_code, // Adjust if this is an array or undefined
                        invoice_number: invoiceNumber, // Generate unique invoice number
                        revenue_code: item.item_code,
                        type: "Revenue Buildings",
                        service_id: query.service_id,
                        batch: batchNumber,
                    });
                }
        
                buildingPayload.push({
                    ref_no: new Date().getTime().toString(36),
                    tin: building.building_number,
                    taxpayer_name: building.owner_name,
                    revenue_id: building.building_name,
                    description: building.building_name,
                    amount: totalSum,
                    day: new Date().getDate(),
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    entered_by: query.username,
                    invoice_number: invoiceNumber, // Generate unique invoice number
                    source: "Buildings",
                    business_tag: building.building_tag,
                    AmountDue: totalSum,
                    batch: batchNumber,
                    service_id: query.service_id
                });
            }
        
            const t = await this.db.transaction();
            try {
                const createdRevenues = await Revenues_invoices.bulkCreate(buildingPayload, { transaction: t, returning: true, });
                await Tax_items.bulkCreate(assessmentItems, {
                    updateOnDuplicate: [
                        "taxitem",
                        "amount",
                        "business_tag",
                        "taxyear",
                        "revenue_code",
                        "invoice_number",
                        "type",
                    ],
                    transaction: t,
                });
                await t.commit();
                return {
                    status: true,
                    message: `Generated ${createdRevenues.length} invoice${createdRevenues.length > 1 ? 's': ''}`,
                }
            } catch (error) {
                console.log(error)
                await t.rollback();
                throw new Error(`Transaction failed: ${error.message}`);
            }
        } catch (error) {
            console.log(error)
            throw new Error(error.message)
        }
    }

    async demandNotice(query) {
        const [ invoice, items ] = await Promise.all([
            Revenues_invoices.findOne({ where: { 
                year: query.year,
                invoice_number: query.invoice_number,
            }, raw: true }),
            Tax_items.findAll({ where: {
                taxyear: query.year,
                invoice_number: query.invoice_number,
            }, raw: true })
        ])

        return {
            invoice, items
        }
    }
    

    

}

module.exports = new Mandates()