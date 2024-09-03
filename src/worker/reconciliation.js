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
const RevenuesInvoices = require("../model/RevenueInvoice");

const Op = Sequelize.Op;

// console.log({workerData});
// return
// const date = new Date();
// console.log(date)
// return

const run = async () => {
  const rows = await readXlsxFile(path.join(__dirname, "../../uploads/" + workerData.file));
  rows.shift();
  // console.log(rows)
  // return 
  let uploads = [];
  let assessmentItems = [];

  const batchNumber =new Date().getTime().toString(36) +"_" +(Date.now() + Math.random().toString()).split(".").join("_");

  for (const row of rows) {
    let invNum = await Invoice_number_count.findOne({ raw: true });
    let InvoiceNumber = "ABJ" + invNum.invoice_number;

    const ward = await Ward.findOne({ where: { city: row[4] }, raw: true });
    const street = await Streets.findOne({
      where: { street: row[7] },
      raw: true,
    });
    const payerId = randomNum(10) + parseInt(invNum.invoice_number);

    const rv = typeof row[1] === "string" ? row[1].split('/') : [row[1]];
    const amt = typeof row[6] === "string" ? row[6].split('/') : [row[6]];
    const sum = amt.reduce((accumulator, currentValue) => {
      return accumulator + parseFloat(currentValue);
    }, 0);


    let payload = {
      tax_office_id: 8477,
      service_id: workerData.service_id,
      ref_no: new Date().getTime().toString(36),
      tin: payerId,
      taxpayer_name: row[2],
      revenue_id: row[3],
      description: row[1],
      amount: sum,
      amount_paid: sum,
      day: new Date().getDay(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      entered_by: workerData.username,
      invoice_number: InvoiceNumber,
      paid: 1,
      batch: batchNumber,
      ward: ward == null ? row[7] : ward.city_id, 
      session_id: street == null ? row[4] : street.idstreet,
      RevenueHeadName: row[5],
      payment_date: new Date(row[8])
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
        payment_status: 1,
        amount_paid: amt[i],
      };
      assessmentItems.push(item);
    }
    
    uploads.push(payload);
    // pic uniq id
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
    await RevenuesInvoices.bulkCreate(uploads,{
      updateOnDuplicate: [
        "ref_no", "tin", "taxpayer_name", "revenue_id", "description", "amount", "amount_paid", "day", "month", "year", "entered_by", "invoice_number", "paid", "batch"
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
    // console.error(error);
    throw error;
  }
};

run();
