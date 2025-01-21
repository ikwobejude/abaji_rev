const eventEmitter = require('events');
const Tax_items = require("../model/Tax_items");
const TaxPayers = require("../model/TaxPayers");

const emitter = new eventEmitter();
require('../events/validation/schema')(emitter)
class Taxpayer {
    constructor() {
        this.tax_payers = TaxPayers
    }

    async create(body) {
        emitter.emit('beforeCreateTaxpayer', body)
        await this.tax_payers.create({
            taxpayer_name: body.taxpayer_name, 
            taxpayer_tin: body.taxpayer_tin, 
            mobile_number: body.mobile_number, 
            email_addresss: body.email_addresss, 
            tax_payer_type: body.tax_payer_type, 
            service_id: body.service_id, 
            contactaddress: body.contactaddress, 
            photo_url: body.photo_url, 
            rcc: body.tax_payer_type === "Company" ? body.rcc : '', 
            bvn: body.bvn, 
            nin: body.nin, 
        })

        return {
            status: true,
            message: "Created!"
        }
    }

    async findAll(query) {

        let perPage = 50; // number of records per page
        var page = query.page || 1;
        let offset = perPage * page - perPage;

        const [results, count] = await Promise.all([
            this.tax_payers.findAll({
                where: {
                    service_id: query.service_id,
                    [Op.and]: [
                        query.taxpayer_name && { taxpayer_name: query.taxpayer_name },
                        query.tax_payer_type && { tax_payer_type: query.tax_payer_type },
                       { [Op.or]:[
                            query.mobile_number &&  { mobile_number: query.mobile_number },
                            query.taxpayer_tin &&  { taxpayer_tin: query.taxpayer_tin },
                            query.email_addresss &&  { email_addresss: query.email_addresss },
                        ]
                       }
                    ],
                },
                limit: perPage,
                offset: offset,
                raw: true
            }),
            this.tax_payers.count({
                where: {
                    service_id: query.service_id,
                    [Op.and]: [
                        query.taxpayer_name && { taxpayer_name: query.taxpayer_name },
                        query.tax_payer_type && { tax_payer_type: query.tax_payer_type },
                       { [Op.or]:[
                            query.mobile_number &&  { mobile_number: query.mobile_number },
                            query.taxpayer_tin &&  { taxpayer_tin: query.taxpayer_tin },
                            query.email_addresss &&  { email_addresss: query.email_addresss },
                        ]
                       }
                    ],
                },
            })
        ])

        return {
            results, count
        }
    }

    async findOne(id) {
        return await this.tax_payers.findByPk(id, {raw: true})
    }
}

module.exports = new Taxpayer()