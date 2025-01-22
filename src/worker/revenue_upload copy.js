const path = require("path");
const { workerData, parentPort } = require("worker_threads");
// const { v4: uuidv4 } = require('uuid');
const Sequelize = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
// const progress = require("../model/Application/Progress");
const { randomNum } = require("../helper/helper");
const Streets = require("../model/Street");
const Ward = require("../model/Ward");
const db = require("../db/connection");
const Revenue_upload = require("../model/Revenue_upload");
const Revenue_item = require("../model/Revenue_item");
const Invoice_number_count = require("../model/Invoice_count");
const Tax_items = require("../model/Tax_items");
const Bud_pay = require('../classes/budpay.service');
const Tax_offices = require("../model/Office");
const bud_pay = new Bud_pay()

const Op = Sequelize.Op;

// console.log({workerData});
// return
const date = new Date();

// SN
// Business Name 1
// Name Of Rate Payers 2
// Address Of Business 3
// Ward 4
// Street 5
// Business Operation	6
// Revenue Item Name(s)	7
// Revenue Item Code(s)	8
// Item Prices	9
// Payer Phone Number	10
// Email 11


const run = async () => {
  const rows = await readXlsxFile(path.join(__dirname, "../../uploads/" + workerData.file));
  rows.shift();
  // console.log(rows)
  // return 

  if(workerData.service_type === "State") {
    let uploads = [];
    let assessmentItems = [];
  
    const batchNumber = new Date().getTime().toString(36) + "_" + (Date.now() + Math.random().toString()).split(".").join("_");
  
    for (const row of rows) {
      let invNum = await Invoice_number_count.findOne({ raw: true });
      
      const taxOffice = await Tax_offices.findOne({ where: { tax_office: row[4] }, raw: true });
      if(!taxOffice) {
        await Tax_offices.create({
          tax_office: row[4],
          service_id: workerData.service_id
        })
      }
    
  
      const office = taxOffice ? taxOffice : await Tax_offices.findOne({ where: { tax_office: row[4] }, raw: true });
  
  
      const payerId = randomNum(10) + parseInt(invNum.invoice_number);
      
      // let revenueCodes = typeof row[2] === "string" ? row[2].split("/") : [row[2]];
      const rv = typeof row[7] === "string" ? row[7].split('/') : [row[7]];
      const rc = typeof row[8] === "string" ? row[8].split('/') : [row[9]];
      const amt = typeof row[9] === "string" ? row[9].split('/') : [row[9]];
      const sum = amt.reduce((accumulator, currentValue) => {
        return accumulator + parseFloat(currentValue);
      }, 0);
      // console.log(amt, sum)

      // return
      let InvoiceNumber = workerData.service_code + invNum.invoice_number;
      let payload = {
        biller_accountid: invNum.invoice_number, //data.success == true ? data.data.paycode : new Date().getTime().toString(36),
        assessment_no: payerId,
        revenue_code: row[8],
        bill_ref_no:  InvoiceNumber, // invoice number
        name_of_business: row[1], // Name Of Rate Payers
        revenue_type: row[7], // Revenue Name
        address_of_property: row[3] /* Address Of Business */,
        type_of_property: row[6] /* Business Operation */,
        annaul_value: sum,
        rate_payable: sum, // item price
        grand_total: sum,
        rate_year: new Date().getFullYear(),
        // rate_district: ward == null ? row[4] : ward.city_id,
        // street: street == null ? row[5] : street.idstreet,
        batch: batchNumber,
        invoice_number: InvoiceNumber,  // data.success == true ? data.data.ref_id : InvoiceNumber,
        state_tin: InvoiceNumber, //data.success == true ? data.data.invoice_id : InvoiceNumber,
        phone_number: row[10] || "0910009900",
        generated_phone: row[10] || "0910009900",
        email: row[11] || "",
        ass_status: 0, // data.success == true ? 1: 0,
        tax_office_id: office.tax_office_id,
        service_id: workerData.service_id
      };
  
  
      for (let i = 0; i < rv.length; i++) {
        let item = {
          idtax: new Date().getTime().toString(36),
          taxitem: rv[i],
          amount: amt[i],
          business_tag: payerId,
          taxyear: new Date().getFullYear(),
          revenue_code: rc[i], // Revenue Name,
          invoice_number: InvoiceNumber,
          type: rv[i], // Revenue Name,
          service_id: workerData.service_id,
          batch: batchNumber,
          tax_office: office.tax_office_id,
        };
        assessmentItems.push(item);
      }
      
      uploads.push(payload);
      
  
      // uploads.push(upload);
      await Invoice_number_count.update(
        { invoice_number: invNum.invoice_number + 1 },
        { where: { invoice_number: invNum.invoice_number } },
        { new: true }
      );
    }
  
    // console.log({ uploads, assessmentItems })
  
    // return
  
    const t = await db.transaction();
    try {
      await Revenue_upload.bulkCreate(uploads,{
        updateOnDuplicate: [
          "revenue_code", "bill_ref_no", "name_of_business", "revenue_type", "address_of_property", "type_of_property", "annaul_value", "rate_payable", "grand_total", "rate_year", "rate_district", "street", "batch", "invoice_number"
        ] // Fields to update if duplicate
      }, { transaction: t });
      await Tax_items.bulkCreate(assessmentItems, {
            updateOnDuplicate: ["taxitem", "amount", "business_tag", "taxyear", "revenue_code", "invoice_number", "type"] // Fields to update if duplicate
          },
         { transaction: t });
      await t.commit();
      
      parentPort.postMessage({
        status: true,
        message: "Successfully Uploaded",
      });
    } catch (error) {
      console.error(error);
      throw Error(error.message);
    }
  } else {
    let uploads = [];
    let assessmentItems = [];
  
    const batchNumber = new Date().getTime().toString(36) + "_" + (Date.now() + Math.random().toString()).split(".").join("_");
  
    for (const row of rows) {
      let invNum = await Invoice_number_count.findOne({ raw: true });
      
      const wd = await Ward.findOne({ where: { city: row[4] }, raw: true });
      if(!wd) {
        await Ward.create({
          city: row[4],
          lga_id: 276,
          service_id: workerData.service_id
        })
      }
      const strt = await Streets.findOne({
        where: { street: row[5] },
        raw: true,
      });
  
      if(!strt) {
        const ward = await Ward.findOne({ where: { city: row[4] }, raw: true });
        await Streets.create({
          street: row[5],
          city_id: ward.city_id
        })
      }
  
      const ward = wd ? wd : await Ward.findOne({ where: { city: row[4] }, raw: true });
      const street = strt ? strt  : await Streets.findOne({ where: { street: row[5] }, raw: true,});
  
  
      const payerId = randomNum(10) + parseInt(invNum.invoice_number);
      
      // let revenueCodes = typeof row[2] === "string" ? row[2].split("/") : [row[2]];
      const rv = typeof row[7] === "string" ? row[7].split('/') : [row[7]];
      const rc = typeof row[8] === "string" ? row[8].split('/') : [row[9]];
      const amt = typeof row[9] === "string" ? row[9].split('/') : [row[9]];
      const sum = amt.reduce((accumulator, currentValue) => {
        return accumulator + parseFloat(currentValue);
      }, 0);
      // console.log(amt, sum)

      // return
      let InvoiceNumber = workerData.service_code + invNum.invoice_number;;
      let payload = {
        biller_accountid: invNum.invoice_number, //data.success == true ? data.data.paycode : new Date().getTime().toString(36),
        assessment_no: payerId,
        revenue_code: row[8],
        bill_ref_no:  InvoiceNumber, // invoice number
        name_of_business: row[1], // Name Of Rate Payers
        revenue_type: row[7], // Revenue Name
        address_of_property: row[3] /* Address Of Business */,
        type_of_property: row[6] /* Business Operation */,
        annaul_value: sum,
        rate_payable: sum, // item price
        grand_total: sum,
        rate_year: new Date().getFullYear(),
        rate_district: ward == null ? row[4] : ward.city_id,
        street: street == null ? row[5] : street.idstreet,
        batch: batchNumber,
        invoice_number: InvoiceNumber,  // data.success == true ? data.data.ref_id : InvoiceNumber,
        state_tin: InvoiceNumber, //data.success == true ? data.data.invoice_id : InvoiceNumber,
        phone_number: row[10] || "0910009900",
        generated_phone: row[10] || "0910009900",
        email: row[11] || "",
        ass_status: 0, // data.success == true ? 1: 0,
        tax_office_id: 8477,
        service_id: workerData.service_id
      };
  
  
      for (let i = 0; i < rv.length; i++) {
        const itemName = rv[i] == "Business Premises" ? 10010 : rv[i] == "RTV" ? 10011 : rv[i] == "Abaji Main Market Shade" ? 10012: 10014;
        let item = {
          idtax: new Date().getTime().toString(36),
          taxitem: rv[i],
          amount: amt[i],
          business_tag: payerId,
          taxyear: new Date().getFullYear(),
          revenue_code: rc[i], // Revenue Name,
          invoice_number: InvoiceNumber,
          type: rv[i], // Revenue Name,
          service_id: workerData.service_id,
          batch: batchNumber,
        };
        assessmentItems.push(item);
      }
      
      uploads.push(payload);
      
  
      // uploads.push(upload);
      await Invoice_number_count.update(
        { invoice_number: invNum.invoice_number + 1 },
        { where: { invoice_number: invNum.invoice_number } },
        { new: true }
      );
    }
  
    // console.log({ uploads, assessmentItems })
  
    // return
  
    const t = await db.transaction();
    try {
      await Revenue_upload.bulkCreate(uploads,{
        updateOnDuplicate: [
          "revenue_code", "bill_ref_no", "name_of_business", "revenue_type", "address_of_property", "type_of_property", "annaul_value", "rate_payable", "grand_total", "rate_year", "rate_district", "street", "batch", "invoice_number"
        ] // Fields to update if duplicate
      }, { transaction: t });
      await Tax_items.bulkCreate(assessmentItems, {
            updateOnDuplicate: ["taxitem", "amount", "business_tag", "taxyear", "revenue_code", "invoice_number", "type"] // Fields to update if duplicate
          },
         { transaction: t });
      await t.commit();
      
      parentPort.postMessage({
        status: true,
        message: "Successfully Uploaded",
      });
    } catch (error) {
      console.error(error);
      throw Error(error.message);
    }
  }
  
};

run();
