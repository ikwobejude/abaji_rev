const input = require("../lib/input_validation");
const Revenue_item = require("../model/Revenue_item");

class Setup {
    constructor(){
        this.revenue_item = Revenue_item
        this.inputValidation = input
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
}

module.exports = Setup