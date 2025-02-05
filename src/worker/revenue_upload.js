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

// console.log(workerData);
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
  try {
    const rows = await readXlsxFile(path.join(__dirname, "../../uploads/" + workerData.file));
    rows.shift(); // Remove header row

    const batchNumber = generateBatchNumber();
    const uploads = [];
    const assessmentItems = [];

    for (const row of rows) {
      const invoiceNumber = await getNextInvoiceNumber();
      
      // Handle service_type "State" and others
      const { payload, items } = workerData.service_type === "State"
        ? await processStateServiceType(row, invoiceNumber, batchNumber)
        : await processNonStateServiceType(row, invoiceNumber, batchNumber);
        console.log(payload)
        // return

      uploads.push(payload);
      assessmentItems.push(...items);

      // Update invoice number
      await updateInvoiceNumber(invoiceNumber);
    }

    // Perform database transaction
    await saveToDatabase(uploads, assessmentItems);

    parentPort.postMessage({
      status: true,
      message: "Successfully Uploaded",
    });
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

// Generate a batch number
const generateBatchNumber = () =>
  `${new Date().getTime().toString(36)}_${Date.now()}_${Math.random().toString().split(".").join("_")}`;

// Fetch and update invoice number
const getNextInvoiceNumber = async () => {
  const invNum = await Invoice_number_count.findOne({ raw: true });
  return invNum.invoice_number;
};

const updateInvoiceNumber = async (currentNumber) => {
  await Invoice_number_count.update(
    { invoice_number: currentNumber + 1 },
    { where: { invoice_number: currentNumber } },
    { new: true }
  );
};

// Process rows for "State" service type
const processStateServiceType = async (row, invoiceNumber, batchNumber) => {
  const taxOfficeId = await getOrCreateTaxOfficeId(row[4]);
  const revenueData = parseRevenueData(row);

  const payload = createPayload({
    row,
    invoiceNumber,
    batchNumber,
    taxOfficeId,
    revenueSum: revenueData.sum,
  });

  

  const items = createAssessmentItems({
    row,
    invoiceNumber,
    batchNumber,
    revenueData,
    taxOfficeId,
  });
  // console.log(items)

  return { payload, items };
};

// Process rows for non-"State" service type
const processNonStateServiceType = async (row, invoiceNumber, batchNumber) => {
  const wardId = await getOrCreateWardId(row[4]);
  const streetId = await getOrCreateStreetId(row[5], wardId);
  const revenueData = parseRevenueData(row);

  const payload = createPayload({
    row,
    invoiceNumber,
    batchNumber,
    wardId,
    streetId,
    revenueSum: revenueData.sum,
  });

  const items = createAssessmentItems({
    row,
    invoiceNumber,
    batchNumber,
    revenueData,
    wardId,
    streetId,
  });

  return { payload, items };
};

// Parse revenue data from row
const parseRevenueData = (row) => {
  const rv = typeof row[7] === "string" ? row[7].split("/") : [row[7]];
  const rc = typeof row[8] === "string" ? row[8].split("/") : [row[9]];
  const amt = typeof row[9] === "string" ? row[9].split("/") : [row[9]];
  const sum = amt.reduce((acc, cur) => acc + (parseFloat(cur) || 0), 0);

  return { rv, rc, amt, sum };
};

// Create payload for bulk insert
const createPayload = ({ row, invoiceNumber, batchNumber, taxOfficeId, wardId, streetId, revenueSum }) => ({
  biller_accountid: invoiceNumber,
  assessment_no: randomNum(10) + parseInt(invoiceNumber),
  revenue_code: row[8],
  bill_ref_no: `${workerData.service_code}${invoiceNumber}`,
  name_of_business: row[1],
  revenue_type: row[7],
  address_of_property: row[3],
  type_of_property: row[6],
  annaul_value: revenueSum,
  rate_payable: revenueSum,
  grand_total: revenueSum,
  rate_year: new Date().getFullYear(),
  rate_district: wardId || row[4],
  street: streetId || row[5],
  batch: batchNumber,
  invoice_number: `${workerData.service_code}${invoiceNumber}`,
  phone_number: row[10] || "0910009900",
  email: row[11] || "",
  tax_office_id: taxOfficeId,
  service_id: workerData.service_id,
});

// Create assessment items for bulk insert
const createAssessmentItems = ({ row, invoiceNumber, batchNumber, revenueData, taxOfficeId, wardId, streetId }) =>
  revenueData.rv.map((revenue, index) => ({
    idtax: new Date().getTime().toString(36),
    taxitem: revenue,
    amount: revenueData.amt[index],
    business_tag: `${workerData.service_code}${invoiceNumber}`,
    taxyear: new Date().getFullYear(),
    revenue_code: revenueData.rc[index],
    invoice_number: `${workerData.service_code}${invoiceNumber}`,
    type: revenue,
    service_id: workerData.service_id,
    batch: batchNumber,
    tax_office: taxOfficeId,
  }));

// Fetch or create tax office ID
const getOrCreateTaxOfficeId = async (taxOfficeName) => {
  let taxOffice = await Tax_offices.findOne({ where: { tax_office: taxOfficeName }, raw: true });
  if (!taxOffice) {
    taxOffice = await Tax_offices.create({ 
      tax_office: taxOfficeName, 
      office_address: taxOfficeName, 
      tax_office_id: Date.now(), 
      phone_number: '090747744646',
      service_id: workerData.service_id });
  }
  return taxOffice.tax_office_id;
};

// Fetch or create ward ID
const getOrCreateWardId = async (wardName) => {
  let ward = await Ward.findOne({ where: { city: wardName }, raw: true });
  if (!ward) {
    ward = await Ward.create({ city: wardName, lga_id: 276, service_id: workerData.service_id });
  }
  return ward.city_id;
};

// Fetch or create street ID
const getOrCreateStreetId = async (streetName, wardId) => {
  let street = await Streets.findOne({ where: { street: streetName }, raw: true });
  if (!street) {
    street = await Streets.create({ street: streetName, city_id: wardId });
  }
  return street.idstreet;
};

// Save uploads and items to the database
const saveToDatabase = async (uploads, assessmentItems) => {
  const t = await db.transaction();
  try {
    await Revenue_upload.bulkCreate(uploads, {
      updateOnDuplicate: [
        "revenue_code",  "annaul_value", "rate_payable",
        "grand_total", "rate_year",  "service_id"
      ],
      transaction: t,
    });

    await Tax_items.bulkCreate(assessmentItems, {
      updateOnDuplicate: ["taxitem", "amount", "business_tag", "taxyear", "revenue_code", "invoice_number", "type"],
      transaction: t,
    });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
};


run();
