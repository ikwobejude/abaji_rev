const Sequelize = require("sequelize");
const db = require("../db/connection");
const Api_Payments = require("../model/Api_payments");

class Reports {
  constructor() {
    this.db = db;
    this.api_payment = Api_Payments;
  }

  async paymentReport(query) {
    let perPage = 20; // number of records per page
    var page = query.page || 1;
    let offset = perPage * page - perPage;
    let year = query.current_year
      ? query.current_year
      : new Date().getFullYear();

    let sql = `
        SELECT
            api_payments.PaymentLogId,
            api_payments.CustReference,
            api_payments.Amount,
            api_payments.PaymentMethod,
            api_payments.BankName,
            api_payments.PaymentDate,
            api_payments.PaymentCurrency
        FROM api_payments
        WHERE api_payments.service_id IS NOT NULL`;

    if (query.assessment_no)
      sql += ` AND api_payments.CustReference = "${query.assessment_no}"`;
    if (query.payment_ref)
      sql += ` AND api_payments.PaymentLogId = "${query.payment_ref}"`;
    if (query.payment_method)
      sql += ` AND api_payments.PaymentMethod = "${query.payment_method}"`;

    if (query.payment_date_from && query.payment_date_to) {
      sql += ` AND Date(api_payments.PaymentDate) BETWEEN '${query.payment_date_from}' AND '${query.payment_date_to}'`;
    } else if (query.payment_date_from) {
      sql += ` AND Date(api_payments.PaymentDate) >= '${query.payment_date_from}'`;
    } else if (query.payment_date_to) {
      sql += ` AND Date(api_payments.PaymentDate) <= '${query.payment_date_to}'`;
    }

    if (query.from && query.to) {
      sql += ` AND Date(api_payments.logged_date) >= '${query.from}'`;
      sql += ` AND Date(api_payments.logged_date) <= '${query.to}'`;
    }

    if (query.from && !query.to) {
      sql += ` AND Date(api_payments.logged_date) = '${query.from}'`;
    }

    const result = await db.query(sql, { type: Sequelize.QueryTypes.SELECT });
    sql += ` LIMIT ${perPage} OFFSET ${offset}`;
    const totalRecords = await db.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    });
    const count = totalRecords.length;

    return {
      result,
      year: year,
      current: page,
      count,
      pages: Math.ceil(count / perPage),
      ChannelName: query.ChannelName,
      assessment_no: query.assessment_no,
      payment_ref: query.payment_ref,
      payment_method: query.payment_method,
      payment_date_from: query.payment_date_from,
      payment_date_to: query.payment_date_to,
      from: query.from,
      to: query.to,
    };
  }

  async assessmentReports(query) {
    let perPage = 20; // number of records per page
    var page = query.page || 1;
    let offset = perPage * page - perPage;
    let year = query.current_year
      ? query.current_year
      : new Date().getFullYear();

    console.log(year);

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
                r.amount_paid,
                r.rate_year,
                r.date_uploaded,
                r.payment_date,
                c.city,
                s.street
            FROM revenue_upload AS r
            INNER JOIN _cities AS c ON c.city_id = r.rate_district or c.city = r.rate_district
            INNER JOIN _streets AS s ON s.idstreet = r.street or s.street = r.street
        WHERE r.payment_status = 1 AND r.rate_year = ${year} AND r.service_id = ${query.service_id}`;

    if (query.bill_ref)
      sql += ` AND revenue_upload.bill_ref_no = '%${query.bill_ref}%'`;

    if (query.business_name)
      sql +
        ` AND revenue_upload.name_of_business LIKE '%${query.business_name}%'`;

    if (query.rate_year)
      sql + ` AND revenue_upload.rate_year = '%${query.rate_year}%'`;
    if (query.ward) sql + ` AND revenue_upload.ward = '%${query.ward}%'`;
    if (query.street) sql + ` AND revenue_upload.street = '%${query.street}%'`;

    if (query.from && req.query.to) {
      sql += ` AND Date(revenue_upload.date_uploaded) >= '${query.from}'`;
      sql += ` AND Date(revenue_upload.date_uploaded) <= '${query.to}'`;
    }

    if (query.from && !query.to) {
      sql += ` AND Date(revenue_upload.date_uploaded) = '${query.from}'`;
    }

    const revenue = await this.db.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    });
    return {
      result: revenue,
      year: year,
      current: page,
      // count,
      // pages: Math.ceil(count / perPage)
    };
  }

  async revenueReports(query) {}

  async ticketReport(query) {
    let perPage = 20; // Number of records per page
    const page = query.page || 1;
    const offset = perPage * (page - 1);
    const year = query.year || new Date().getFullYear();

    let sql = `
        SELECT
            tickets.id,
            tickets.agent_id,
            tickets.agent_name,
            tickets.ticket_type,
            tickets.location,
            tickets.office_id,
            tickets.day,
            tickets.month,
            tickets.year,
            tickets.ticketId,
            tickets.reference_number,
            tickets.invoice_number,
            tickets.created_on,
            tickets.payment_status,
            tickets.amount,
            tickets.amount_paid,
            tickets.payment_date,
            tickets.batch
        FROM tickets
        WHERE tickets.year = '${year}'`;

   
    if (query.agent_id) sql += ` AND tickets.agent_id = '${query.agent_id}'`;
    if (query.ticket_type)
      sql += ` AND tickets.ticket_type = '${query.ticket_type}'`;
    if (query.location) sql += ` AND tickets.location = '${query.location}'`;
    if (query.payment_status !== undefined)
      sql += ` AND tickets.payment_status = ${query.payment_status}`;
    if (query.payment_date_from && query.payment_date_to) {
      sql += ` AND Date(tickets.payment_date) BETWEEN '${query.payment_date_from}' AND '${query.payment_date_to}'`;
    } else if (query.payment_date_from) {
      sql += ` AND Date(tickets.payment_date) >= '${query.payment_date_from}'`;
    } else if (query.payment_date_to) {
      sql += ` AND Date(tickets.payment_date) <= '${query.payment_date_to}'`;
    }

    //  pagination
    const totalRecordsQuery = await db.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    });
    const count = totalRecordsQuery.length;
    sql += ` LIMIT ${perPage} OFFSET ${offset}`;

    // Execute the final query with limit and offset
    const result = await db.query(sql, { type: Sequelize.QueryTypes.SELECT });

    return {
      result,
      year: year,
      current: page,
      count,
      pages: Math.ceil(count / perPage),
      agent_id: query.agent_id,
      ticket_type: query.ticket_type,
      location: query.location,
      payment_status: query.payment_status,
      payment_date_from: query.payment_date_from,
      payment_date_to: query.payment_date_to,
    };
  }
}

module.exports = Reports;
