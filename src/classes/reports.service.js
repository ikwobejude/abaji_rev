const Sequelize = require("sequelize");
const db = require("../db/connection");
const Api_Payments = require("../model/Api_payments");
const Revenues_invoices = require("../model/Revenue_invoice");
const Op = Sequelize.Op

class Reports {
  constructor() {
    this.db = db;
    this.api_payment = Api_Payments;
  }

  async paymentReport(query) {
    let perPage = 20; // number of records per page
    var page = query.page || 1;
    let offset = perPage * (page - 1);
    let year = query.current_year ? query.current_year : new Date().getFullYear();
    
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
        WHERE api_payments.service_id = :service_id`;
    
    // Dynamic Filtering
    if (query.assessment_no)
      sql += ` AND api_payments.CustReference = :assessment_no`;
    if (query.payment_ref)
      sql += ` AND api_payments.PaymentLogId = :payment_ref`;
    if (query.payment_method)
      sql += ` AND api_payments.PaymentMethod = :payment_method`;
    
    // Date Filtering
    if (query.payment_date_from && query.payment_date_to) {
      sql += ` AND Date(api_payments.PaymentDate) BETWEEN :payment_date_from AND :payment_date_to`;
    } else if (query.payment_date_from) {
      sql += ` AND Date(api_payments.PaymentDate) >= :payment_date_from`;
    } else if (query.payment_date_to) {
      sql += ` AND Date(api_payments.PaymentDate) <= :payment_date_to`;
    }
    
    if (query.from && query.to) {
      sql += ` AND Date(api_payments.logged_date) BETWEEN :from AND :to`;
    } else if (query.from) {
      sql += ` AND Date(api_payments.logged_date) = :from`;
    }
    
    // Ordering (optional, for consistent pagination)
    sql += ` ORDER BY api_payments.PaymentDate DESC`;
    
    // Main Query with Pagination
    let paginatedSQL = sql + ` LIMIT ${perPage} OFFSET ${offset}`;
    
    const result = await db.query(paginatedSQL, {
      replacements: {
        assessment_no: query.assessment_no,
        payment_ref: query.payment_ref,
        payment_method: query.payment_method,
        payment_date_from: query.payment_date_from,
        payment_date_to: query.payment_date_to,
        from: query.from,
        to: query.to,
        service_id: query.service_id
      },
      type: Sequelize.QueryTypes.SELECT,
    });
    
    // Total Record Count (without LIMIT and OFFSET)
    let countSQL = `
        SELECT COUNT(*) as total
        FROM api_payments
        WHERE api_payments.service_id = :service_id`;
    
    if (query.assessment_no)
      countSQL += ` AND api_payments.CustReference = :assessment_no`;
    if (query.payment_ref)
      countSQL += ` AND api_payments.PaymentLogId = :payment_ref`;
    if (query.payment_method)
      countSQL += ` AND api_payments.PaymentMethod = :payment_method`;
    
    if (query.payment_date_from && query.payment_date_to) {
      countSQL += ` AND Date(api_payments.PaymentDate) BETWEEN :payment_date_from AND :payment_date_to`;
    } else if (query.payment_date_from) {
      countSQL += ` AND Date(api_payments.PaymentDate) >= :payment_date_from`;
    } else if (query.payment_date_to) {
      countSQL += ` AND Date(api_payments.PaymentDate) <= :payment_date_to`;
    }
    
    if (query.from && query.to) {
      countSQL += ` AND Date(api_payments.logged_date) BETWEEN :from AND :to`;
    } else if (query.from) {
      countSQL += ` AND Date(api_payments.logged_date) = :from`;
    }
    
    const totalRecords = await db.query(countSQL, {
      replacements: {
        assessment_no: query.assessment_no,
        payment_ref: query.payment_ref,
        payment_method: query.payment_method,
        payment_date_from: query.payment_date_from,
        payment_date_to: query.payment_date_to,
        from: query.from,
        to: query.to,
        service_id: query.service_id
      },
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

    // console.log(year);

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
            LEFT JOIN _cities AS c ON c.city_id = r.rate_district or c.city = r.rate_district
            LEFT JOIN _streets AS s ON s.idstreet = r.street or s.street = r.street
        WHERE  r.rate_year = ${year} AND r.service_id = ${query.service_id}`;

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
    };
  }

  async revenueReports(query) {}

  async ticketReport(query) {
    // console.log({ query });
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
    WHERE revenue_invoices.service_id = ${query.service_id}
   `;

   if (query.from && query.to) {
     sql += ` AND STR_TO_DATE(revenue_invoices.payment_date, '%Y-%m-%d') BETWEEN '${query.from}' AND '${query.to}'`;
   } else if (query.from) {
     sql += ` AND STR_TO_DATE(revenue_invoices.payment_date, '%Y-%m-%d') >= '${query.from}'`;
   } else if (query.to) {
     sql += ` AND STR_TO_DATE(revenue_invoices.payment_date, '%Y-%m-%d') <= '${query.to}'`;
   }


    if (query.assessment_item) sql += ` AND revenue_invoices.taxpayer_name = '${query.assessment_item}'`;
    const totalRecordsQuery = await db.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    });
    // console.log("Final SQL Query:", sql);

    const count = totalRecordsQuery.length;
    // console.log({ count });
    const result = await db.query(sql, { type: Sequelize.QueryTypes.SELECT });

    return {
      count,
      result,
    };
  }

  async revenueInvoicesReport(query) {
    let perPage = 20; // number of records per page
    var page = query.page || 1;
    let offset = perPage * (page - 1);
    let year = query.current_year ? query.current_year : new Date().getFullYear();

    const [results, count] = await Promise.all([
      Revenues_invoices.findAll({
        where: {
          service_id: query.service_id,
          paid: 1,
          [Op.and]: [
            query.source && {source: query.source },
            query.business_building_name && {source: query.business_building_name },
          ]
        }
      }),

      Revenues_invoices.count({
        where: {
          service_id: query.service_id,
          [Op.and]: [
            query.paid && {paid: query.paid },
            query.source && {source: query.source },
            query.business_building_name && {source: query.business_building_name },
          ]
        }
      })
    ])

    return {
      results,
      current: page,
      count,
      pages: Math.ceil(count / perPage),
    }
  }
}

module.exports = Reports;
