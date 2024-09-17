const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs");
const Revenue_upload = require("../model/Revenue_upload");
const Sequelize = require("sequelize");
const db = require("../db/connection");
const Tax_items = require("../model/Tax_items");
const Revenues_invoices = require("../model/Revenue_invoice");
const Bud_pay = require('../classes/budpay.service')



class Revenue extends Bud_pay {
  constructor() {
    super()
    this.revenueUpload = Revenue_upload;
    this.tax_item = Tax_items;
    this.db = db;
    this.Op = Sequelize.Op
  }

  async revenueByYear(data) {
    const revenue = await this.revenueUpload.findAll({
      attributes: [
        ["rate_year", "year"],
        [Sequelize.fn("COUNT", Sequelize.col("*")), "total"],
      ],
      group: ["rate_year"],
      raw: true,
    });
    const batchRevenue = await this.revenueUpload.findAll({
      attributes: [
        ["batch", "batch"],
        [Sequelize.fn("COUNT", Sequelize.col("*")), "total"],
        [Sequelize.fn("SUM", Sequelize.col("ass_status")), "status_count"],
      ],
      group: ["batch"],
      raw: true,
    });
   
    return {
      revenue, batchRevenue
    };
  }

  // async revenueByBatch(data) {
    
  // }

  async truncateYearlyRecord(data) {
    try {
      await this.revenueUpload.destroy({
        where: { [this.Op.or]: [{  rate_year: data.year }, { batch: data.year }] },
      });

      return {
        status: true,
        message: "Deleted!",
      };
    } catch (error) {
      throw error;
    }
  }

  async generate_pay_code_bud_pay(data) {
    try {
      const assessments = await this.revenueUpload.findAll({
        where: { 
          ass_status: 0,
          [this.Op.or]: [
            {  rate_year: data.id }, 
            { batch: data.id }
          ] 
        },
      });


      while (assessments.length > 0) {
          const batch = assessments.splice(0, 10);
          // console.log(`Processing batch of size: ${batch.length}`);
          // Your processing code here
          for (const assessment of batch) {
            const date = new Date(assessment.date_uploaded);
            const bud_pay_payload = {
                title: assessment.revenue_code,
                duedate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}` ,
                currency:"NGN",
                invoicenumber: assessment.invoice_number, // optional
                reminder:"", // optional
                email: process.env.MAIL_FROM_ADDRESS,
                first_name: assessment.name_of_business, // optional but neccessary
                last_name:"", // optional but neccessary
                billing_address: assessment.address_of_property,
                billing_city:"ABAJI",
                billing_state:"ABUJA",
                billing_country:"Nigeria",
                billing_zipcode:"234",
                items:[
                    {
                        description: assessment.type_of_property || assessment.name_of_business,
                        quantity: "1",
                        unit_price: assessment.grand_total,
                        meta_data:""
                    }
                ]
            }
    
        // console.log(bud_pay_payload)
        
            const data = await this.createInvoice(bud_pay_payload)
            await this.revenueUpload.update({
              biller_accountid: data.success == true ? data.data.paycode: assessment.biller_accountid,
              invoice_number: data.success == true ? data.data.ref_id : assessment.invoice_number,
              state_tin: data.success == true ? data.data.invoice_id : assessment.state_tin,
              ass_status: data.success == true ? 1: 0,
            }, 
            { where: {bill_ref_no: assessment.bill_ref_no }}, 
            {new: true})
          // return
          }
      }

      

      return {
        status: true,
        message: "successfull!",
      };
    } catch (error) {
      throw error;
    }
  }


  


  async revenuesInvoices(query) {
    let condition = [];
    let queryParams = [];

    if (query.year) {
      condition.push("r.rate_year = ?");
      queryParams.push(query.year);
    }

    if (query.street) {
      condition.push("r.street = ?");
      queryParams.push(query.street);
    }

    if (query.assessment_no) {
      condition.push("r.assessment_no = ?");
      queryParams.push(query.assessment_no);
    }

    if (query.revenue_code) {
      condition.push("r.revenue_code = ?");
      queryParams.push(query.revenue_code);
    }

    if (query.bill_ref_no) {
      condition.push("r.bill_ref_no = ?");
      queryParams.push(query.bill_ref_no);
    }

    if (query.name_of_business) {
      condition.push("r.name_of_business LIKE ?");
      queryParams.push(`%${query.name_of_business}%`);
    }

    if (query.address_of_property) {
      condition.push("r.address_of_property LIKE ?");
      queryParams.push(`%${query.address_of_property}%`);
    }

    if (query.type_of_property) {
      condition.push("r.type_of_property LIKE ?");
      queryParams.push(`%${query.type_of_property}%`);
    }

    if (query.revenue_type) {
      condition.push("r.revenue_type LIKE ?");
      queryParams.push(`%${query.revenue_type}%`);
    }

    if (query.batch) {
      condition.push("r.batch = ?");
      queryParams.push(query.batch);
    }

    // Clean up any null conditions
    condition = condition.filter((cond) => cond !== null);

    let whereClause = condition.length
      ? `WHERE ${condition.join(" AND ")}`
      : "";

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
      LEFT JOIN _cities AS c ON c.city_id = r.rate_district OR c.city = r.rate_district
      LEFT JOIN _streets AS s ON s.idstreet = r.street OR s.street = r.street
      ${whereClause}
  `;

    try {
      const revenue = await this.db.query(sql, {
        replacements: queryParams,
        type: Sequelize.QueryTypes.SELECT,
      });

      return {
        revenue,
      };
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  async demandNotice(query) {
    let sql = `
            SELECT 
                r.service_id,
                r.biller_accountid,
                r.ass_status,
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
            WHERE r.rate_year = :rate_year AND r.bill_ref_no= :bill_ref_no
        `;


    const revenue = await this.db.query(sql, {
      replacements: {
        bill_ref_no: query.invoice,
        rate_year: query.year
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    // console.log(sql)

    // console.log(revenue)
    const tax_items = await this.tax_item.findAll({
      where: { invoice_number: query.invoice },
      raw: true,
    });
    // console.log(revenue)
    return {
      revenue: revenue[0],
      items: tax_items,
    };
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
      console.log(fileName);
      return {
        status: true,
        fileName,
      };
    } catch (e) {
      console.log(e);
      throw Error(e.message);
    }
  }

  async uploadCooperateBusinessData(data) {
    const res = await this.base64ToExcel(data.base64url);
    // console.log(res)
    // return
    if (res.status == true) {
      const res1 = new Promise((resolve, reject) => {
        const file = res.fileName;
        console.log(file);
        const worker = new Worker(
          path.join(__dirname, `../worker/revenue_upload.js`),
          {
            workerData: {
              file,
              service_id: data.service_id,
            },
          }
        );

        worker.on("message", (data) => {
          // console.log(data)
          resolve(data);

          let deleteFile = path.join(__dirname, `../../uploads/${file}`);

          if (fs.existsSync(deleteFile)) {
            fs.unlink(deleteFile, (err) => {
              if (err) {
                console.log(err);
              }
              console.log("deleted");
            });
          }
          return data;
        });

        worker.on("error", (error) => {
          console.log({ error });
          reject(error);
          throw Error(error.message);
        });

        worker.on("exit", (code) => {
          if (code !== 0)
            throw Error(`Worker has stopped working with exit code ${code}`);
        });
      });

      return res1;
    } else {
      // return res
      throw Error(res.message);
    }
  }

  // async payments_records(query) {
  //   return {};
  // }
  async viewUploadedPaymentbATCH(query) {
    let sql = `
      SELECT
        count(*) as count, 
        MAX(revenue_invoices.batch) AS batch ,
        MAX(revenue_invoices.ref_no) AS ref_no,
        MAX(revenue_invoices.tin) AS tin,
        SUM(revenue_invoices.amount) as amount,
        MAX(revenue_invoices.day) AS day,
        MAX(revenue_invoices.month) AS month,
        MAX(revenue_invoices.year) AS year,
        MAX(_cities.city) AS city,
        MAX(_streets.street) AS street
      FROM revenue_invoices 
      LEFT JOIN _cities ON _cities.city_id = revenue_invoices.ward
      LEFT JOIN _streets ON _streets.idstreet = revenue_invoices.session_id
      WHERE revenue_invoices.year = 2024
      GROUP BY revenue_invoices.batch
    `;

    const data = await this.db.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    });
    return {
      data,
    };
  }
  async viewUploadedPayment(query) {
    let sql = `
      SELECT 
        revenue_invoices.ref_no,
        revenue_invoices.tin,
        revenue_invoices.taxpayer_name,
        revenue_invoices.revenue_id,
        revenue_invoices.description,
        revenue_invoices.amount,
        revenue_invoices.day,
        revenue_invoices.month,
        revenue_invoices.year,
        revenue_invoices.payment_date,
        revenue_invoices.RevenueHeadName,
        _cities.city,
        _streets.street
      FROM revenue_invoices 
      LEFT JOIN _cities ON _cities.city_id = revenue_invoices.ward
      LEFT JOIN _streets ON _streets.idstreet = revenue_invoices.session_id
      WHERE revenue_invoices.batch = '${query.batch}'
    `;

    const data = await this.db.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    });
    return {
      data,
    };
  }

  async deleteBatchUpload(id) {
    await Revenues_invoices.destroy({ where: { batch: id } });
    return {
      status: true,
      message: "Deleted",
    };
  }

  async upload_payments(data) {
    const res = await this.base64ToExcel(data.base64url);

    // return
    delete data.base64url;
    // console.log(data)
    if (res.status == true) {
      const res1 = new Promise((resolve, reject) => {
        const file = res.fileName;
        console.log(file);
        const worker = new Worker(
          path.join(__dirname, `../worker/reconciliation.js`),
          {
            workerData: {
              file,
              ...data,
            },
          }
        );

        worker.on("message", (data) => {
          // console.log(data)
          resolve(data);

          let deleteFile = path.join(__dirname, `../../uploads/${file}`);

          if (fs.existsSync(deleteFile)) {
            fs.unlink(deleteFile, (err) => {
              if (err) {
                console.log(err);
              }
              console.log("deleted");
            });
          }
          return data;
        });

        worker.on("error", (error) => {
          console.log({ error });
          reject(error);
          throw Error(error.message);
        });

        worker.on("exit", (code) => {
          if (code !== 0)
            throw Error(`Worker has stopped working with exit code ${code}`);
        });
      });

      return res1;
    } else {
      // return res
      throw Error(res.message);
    }
  }

  async initiateDiscount(invoice, data) {
    // console.log(invoice, data)
    let sum = 0;
    for (const el of data) {
      sum += parseFloat(el.amount);
      await this.tax_item.update(
        { discount: el.amount },
        { where: { id: el.id } },
        { new: true }
      );
      // console.log(el)
    }
    // await this.revenueUpload.update({goodwill: sum}, { where: {bill_ref_no: invoice} }, {new: true})

    // console.log(sum)
    return {
      status: true,
      message: "Discount applied",
    };
  }
}

module.exports = Revenue;
