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
  // rows.shift();
  // console.log(rows)
  // return 
  let uploads = [];
  let assessmentItems = [];

  // console.log(rows)

  const batchNumber =new Date().getTime().toString(36) +"_" +(Date.now() + Math.random().toString()).split(".").join("_");
  
  const PDate = transformData(rows)
  // console.log(PDate)
  // return;
  for (const data of PDate) {
    
    let invNum = await Invoice_number_count.findOne({ raw: true });
    let InvoiceNumber = "ABJ" + invNum.invoice_number;

    // const ward = await Ward.findOne({ where: { city: row[3] }, raw: true });
    // const street = await Streets.findOne({
    //   where: { street: row[6] },
    //   raw: true,
    // });
    const payerId = randomNum(10) + parseInt(invNum.invoice_number);

    // const rv = typeof row[1] === "string" ? row[1].split('/') : [row[1]];
    // const amt = typeof row[8] === "string" ? row[8].split('/') : [row[8]];
    // const sum = amt.reduce((accumulator, currentValue) => {
    //   return accumulator + parseFloat(currentValue);
    // }, 0);

    // const dt = data.Date.split('-')

    let payload = {
      tax_office_id: 8477,
      service_id: workerData.service_id,
      ref_no: new Date().getTime().toString(36),
      tin: payerId,
      taxpayer_name: data.FeeType,
      revenue_id: data.FeeType,
      description: data.FeeType,
      amount: data.Amount,
      amount_paid: data.Amount,
      entered_by: workerData.username,
      invoice_number: InvoiceNumber,
      paid: 1,
      batch: batchNumber,
      RevenueHeadName: data.FeeType,
      payment_date: data.Date,
      day: new Date().getDay(),
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      entered_by: workerData.username
    };

    
    uploads.push(payload);
    // pic uniq id
    await Invoice_number_count.update(
      { invoice_number: invNum.invoice_number + 1 },
      { where: { invoice_number: invNum.invoice_number } },
      { new: true }
    );
  }

 

    await RevenuesInvoices.bulkCreate(uploads,{
      updateOnDuplicate: [
        "ref_no", "tin", "taxpayer_name", "revenue_id", "description", "amount", "amount_paid", "day", "month", "year", "entered_by", "invoice_number", "paid", "batch"
      ] // Fields to update if duplicate
    });

 
    
    parentPort.postMessage({
      status: true,
      message: "Successfully Uploaded",
    });
  
};

run();

// Function to transform the data
function transformData(rows) {
  const headers = rows[0]; // First row will be the headers
  const transformed = [];

  // Loop through each row after the header row
  for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      let date = row[0]; // Assuming the first column is Date

       // If the date is an Excel serial number, convert it to a readable format
       if (typeof date === 'number') {
        date = excelDateToJSDate(date);
       }

      // For each row, loop through the rest of the columns (Fee types)
      for (let j = 1; j < headers.length; j++) {
          const feeType = headers[j];  // Fee type (Market Fee, Cattle fee, etc.)
          const amount = row[j];        // Corresponding amount
          // Ignore the row if the amount is 0 or null
          if (amount !== 0 && amount !== null && !isNaN(amount)) {
            transformed.push({
                Date: date,
                FeeType: feeType,
                Amount: amount || 0  // Default to 0 if no amount
            });
          }
      }
  }

  return transformed;
}


// Function to transform Excel serial date to JavaScript Date
function excelDateToJSDate(excelDate) {
  // Excel dates start from 1900-01-01 (serial date 1)
  const excelEpoch = new Date(1899, 11, 30); // Excel epoch is December 30, 1899
  const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000); // Multiply by milliseconds in a day
  return jsDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

