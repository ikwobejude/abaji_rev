const { Worker } = require("worker_threads")
const path = require("path")
const fs = require("fs")
const Revenue_upload = require("../model/Revenue_upload")
const Sequelize  = require("sequelize")
const db = require('../db/connection')
const Tax_items = require("../model/Tax_items")

class Revenue {
    constructor(){
        this.revenueUpload = Revenue_upload
        this.tax_item = Tax_items
        this.db = db
    }


    async revenueByYear(data) {
        const revenue = await this.revenueUpload.findAll({
            attributes: [
                ['rate_year', 'year'],
                [ Sequelize.fn('COUNT', Sequelize.col('*')),"total"]
            ],
            group: ['rate_year'],
            raw: true
        })
        // console.log(revenue)
        return {
            revenue  
        }
    }

    async revenuesInvoices(query) {
        let sql = `
            SELECT 
                r.assessment_no,
                r.revenue_code,
                r.bill_ref_no,
                r.name_of_business,
                r.address_of_property,            
                r.type_of_property,
                r.revenue_type,
                r.grand_total,
                r.rate_year,
                c.city,
                s.street
            FROM revenue_upload AS r
            INNER JOIN _cities AS c ON c.city_id = r.rate_district or c.city = r.rate_district
            INNER JOIN _streets AS s ON s.idstreet = r.street or s.street = r.street
            WHERE r.rate_year = ${query.year} and r.service_id = ${query.service_id}
        `;
        const revenue = await this.db.query(sql, {type: Sequelize.QueryTypes.SELECT})
        return {
            revenue  
        }
    }

    async demandNotice(query) {
        let sql = `
            SELECT 
                r.service_id,
                r.assessment_no,
                r.revenue_code,
                r.bill_ref_no,
                r.payment_status,
                r.name_of_business,
                r.address_of_property,            
                r.type_of_property,
                r.revenue_type,
                r.grand_total,
                r.rate_year,
                r.date_uploaded,
                c.city,
                s.street
            FROM revenue_upload AS r
            INNER JOIN _cities AS c ON c.city_id = r.rate_district or c.city = r.rate_district
            INNER JOIN _streets AS s ON s.idstreet = r.street or s.street = r.street
            WHERE r.rate_year = ${query.year} AND r.bill_ref_no='${query.invoice}'
        `;
        const revenue = await this.db.query(sql, {type: Sequelize.QueryTypes.SELECT})
        const tax_items = await this.tax_item.findAll({ where: {invoice_number: query.invoice }, raw: true})
        // console.log(revenue)
        return {
            revenue: revenue[0],
            items: tax_items
        }
    }


    async base64ToExcel(string) {
        // console.log({string})
        try {
            let base64Data = string.split(",")[1];
            // let hol =  data.split(',')[0];
            let ext = string.split(",")[0].split("/")[1].split(";")[0];
            let fileName = `${Date.now()}.xlsx`;
            const binaryData = Buffer.from(base64Data, "base64").toString("binary");
            // console.log(binaryData)
            fs.writeFileSync(`uploads/${fileName}`, binaryData, "binary");
            // return `${fileName}`;
            console.log(fileName)
            return {
                status: true,
                fileName
            }
        } catch (e) {
            console.log(e)
            throw Error(e.message)
        }
    }

    async uploadCooperateBusinessData(data) {
     
        const res = await this.base64ToExcel(data.base64url)
        // console.log(res)
        // return
        if(res.status == true) {
            const res1 = new Promise((resolve, reject) => {
            const file =  res.fileName;
            console.log(file)
            const worker = new Worker(path.join(__dirname,`../worker/revenue_upload.js`), {
                workerData: {
                file,
                service_id: data.service_id
                },
            });
        
            worker.on("message", (data) => {
                // console.log(data)
                resolve(data);
        
                let deleteFile = path.join(__dirname,`../../uploads/${file}`)
        
                if (fs.existsSync(deleteFile)) {
                    fs.unlink(deleteFile, (err) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log('deleted');
                    })
                }
                return data;
            });
        
            worker.on("error", (error) => {
                console.log({error});
                reject(error);
                throw Error( error.message)
            });
        
            worker.on("exit", (code) => {
                if (code !== 0)
                throw Error(`Worker has stopped working with exit code ${code}`)
            });
            });

            return res1;

        } else {
            // return res
            throw Error(res.message)
        }
    }
}

module.exports = Revenue