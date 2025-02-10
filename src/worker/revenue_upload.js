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
const Bud_pay = require('../classes/budpay.service')
const bud_pay = new Bud_pay()

const Op = Sequelize.Op;

const safeParseFloat = (value) => {
  if (value === null || isNaN(value)) {
      return 0;
  }
  return parseFloat(value);
};

// console.log({workerData});
// return
const date = new Date();

const run = async () => {
  const rows = await readXlsxFile(path.join(__dirname, "../../uploads/" + workerData.file));
  rows.shift();
  // console.log(rows)
  // return 
  let uploads = [];
  let assessmentItems = [];

  const batchNumber =
    new Date().getTime().toString(36) +
    "_" +
    (Date.now() + Math.random().toString()).split(".").join("_");

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
      where: { street: row[7] },
      raw: true,
    });

    if(!strt) {
      const ward = await Ward.findOne({ where: { city: row[4] }, raw: true });
      await Streets.create({
        street: row[7],
        city_id: ward.city_id
      })
    }

    const ward = wd ? wd : await Ward.findOne({ where: { city: row[4] }, raw: true });
    const street = strt ? strt  : await Streets.findOne({ where: { street: row[7] }, raw: true,});


    const payerId = randomNum(10) + parseInt(invNum.invoice_number);
    
    // let revenueCodes = typeof row[2] === "string" ? row[2].split("/") : [row[2]];
    const rv = typeof row[1] === "string" ? row[1].split('/') : [row[1]];
    const amt = typeof row[6] === "string" ? row[6].split('/') : [row[6]];
    const sum = amt.reduce((accumulator, currentValue) => {
      const num = safeParseFloat(currentValue); // Call the function!
      return accumulator + num; // Use the parsed number
  }, 0);
    // console.log(amt, sum)
    // return 
    const bud_pay_payload = {
        title: row[1],
        duedate:"2023-12-30",
        currency:"NGN",
        invoicenumber: invNum.invoice_number, // optional
        reminder:"", // optional
        email: process.env.MAIL_FROM_ADDRESS,
        first_name: row[2], // optional but neccessary
        last_name:"", // optional but neccessary
        billing_address: row[3],
        billing_city:"ABAJI",
        billing_state:"ABUJA",
        billing_country:"Nigeria",
        billing_zipcode:"234",
        items:[
            {
                description: row[5],
                quantity: "1",
                unit_price: sum,
                meta_data:""
            }
        ]
    }


    // const data = await bud_pay.createInvoice(bud_pay_payload)
    // console.log(data);
    // return
    let InvoiceNumber = "ABJ" + invNum.invoice_number;
    let payload = {
      biller_accountid: invNum.invoice_number, //data.success == true ? data.data.paycode : new Date().getTime().toString(36),
      assessment_no: payerId,
      revenue_code: row[1],
      bill_ref_no:  InvoiceNumber, // invoice number
      name_of_business: row[2], // Name Of Rate Payers
      revenue_type: row[1], // Revenue Name
      address_of_property: row[3] /* Address Of Business */,
      type_of_property: row[5] || '' /* Business Operation */,
      annaul_value: sum,
      rate_payable: sum, // item price
      grand_total: sum,
      rate_year: new Date().getFullYear(),
      rate_district: ward == null ? row[7] : ward.city_id,
      street: street == null ? row[4] : street.idstreet,
      batch: batchNumber,
      invoice_number: InvoiceNumber,  // data.success == true ? data.data.ref_id : InvoiceNumber,
      state_tin: InvoiceNumber, //data.success == true ? data.data.invoice_id : InvoiceNumber,
      phone_number: "0910009900",
      generated_phone: "0910009900",
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
        revenue_code: itemName, // Revenue Name,
        invoice_number: InvoiceNumber,
        type: itemName, // Revenue Name,
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
};

run();
