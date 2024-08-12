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

const Op = Sequelize.Op;

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
    let invNum = await invoice_number_count.findOne({ raw: true });
    let InvoiceNumber = "N-ABJ" + invNum.invoice_number;

    const ward = await Ward.findOne({ where: { city: row[4] }, raw: true });
    const street = await Streets.findOne({
      where: { street: row[7] },
      raw: true,
    });
    const payerId = randomNum(10);

    let payload = {
      biller_accountid: new Date().getTime().toString(36),
      assessment_no: payerId,
      revenue_code: row[1] == "Business Premises" ? 10010 : 10011, // Revenue Name
      bill_ref_no: InvoiceNumber, // invoice number
      name_of_business: row[2], // Name Of Rate Payers
      revenue_type: row[1], // Revenue Name
      address_of_property: row[3] /* Address Of Business */,
      type_of_property: row[5] /* Business Operation */,
      annaul_value: row[6],
      rate_payable: row[6], // item price
      grand_total: row[6],
      rate_year: new Date().getFullYear(),
      rate_district: ward.city_id,
      street: street.idstreet,
      batch: batchNumber,
      invoice_number: InvoiceNumber,
    };

    let item = {
      idtax: new Date().getTime().toString(36),
      taxitem: row[1],
      amount: row[6],
      business_tag: payerId,
      taxyear: new Date().getFullYear(),
      revenue_code: revenueCodes[i],
      invoice_number: InvoiceNumber,
      type: row[1] == "Business Premises" ? 10010 : 10011, // Revenue Name,
      service_id: req.user.service_id,
      batch: batchNumber,
    };

    uploads.push(payload);
    assessmentItems.push(item);
  }

  console.log({uploads,
    assessmentItems})

  return

  const t = await db.transaction();
  try {
    await Revenue_upload.bulkCreate(uploads, { t: transaction });
    await Revenue_item.bulkCreate(assessmentItems, { t: transaction });
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
