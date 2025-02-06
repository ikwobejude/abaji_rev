const Sequelize = require("sequelize");
const db = require("../db/connection");
const Api_Payments = require("../model/Api_payments");
const Revenues_invoices = require("../model/Revenue_invoice");
const Tax_items = require("../model/Tax_items");
const Op = Sequelize.Op;

class Reports {
  constructor() {
    this.db = db;
    this.tax_items = Tax_items;
    this.api_payment = Api_Payments;
  }

  async paymentReport(query) {
    let perPage = 20; 
    var page = query.page || 1;
    let offset = perPage * (page - 1);
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

    // Query with Pagination
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
        service_id: query.service_id,
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    // Total Record Count (without LIMIT and OFFSET)
    let countSQL = `
    SELECT COUNT(*) AS total
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
        service_id: query.service_id,
      },
      type: Sequelize.QueryTypes.SELECT,
    });

    const count = totalRecords[0].total; // Correct total count

    return {
      result,
      year: year,
      currentPage: page,
      count, 
      totalPages: Math.ceil(count / perPage),
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
    // console.log(query)
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
       sql += ` AND r.bill_ref_no LIKE '%${query.bill_ref}%'`;

    if (query.business_name)
      sql +
        ` AND r.name_of_business LIKE '%${query.business_name}%'`;

    if (query.rate_year)
      sql + ` AND r.rate_year = '%${query.rate_year}%'`;
    if (query.ward) sql + ` AND r.ward = '%${query.ward}%'`;
    if (query.street) sql + ` AND r.street = '%${query.street}%'`;

    if (query.from && req.query.to) {
      sql += ` AND Date(r.date_uploaded) >= '${query.from}'`;
      sql += ` AND Date(r.date_uploaded) <= '${query.to}'`;
    }

    if (query.from && !query.to) {
      sql += ` AND Date(r.date_uploaded) = '${query.from}'`;
    }
    let totalPaidSql = `
        SELECT SUM(amount_paid) AS totalPaid
        FROM revenue_upload
        WHERE rate_year = ${year} AND service_id = ${query.service_id} AND payment_status = 1
    `;

    let totalOutstandingSql = `
        SELECT SUM(grand_total - IFNULL(amount_paid, 0)) AS totalOutstanding
        FROM revenue_upload
        WHERE rate_year = ${year} AND service_id = ${query.service_id} AND payment_status = 0
    `;
    sql += ` LIMIT ${perPage} OFFSET ${offset}`;
    const totalPaidResult = await this.db.query(totalPaidSql, {
      type: Sequelize.QueryTypes.SELECT,
    });
    let countSql = `
        SELECT COUNT(*) AS totalRecords
        FROM revenue_upload AS r
        WHERE r.rate_year = ${year} AND r.service_id = ${query.service_id}
    `;

    const countResult = await this.db.query(countSql, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const totalRecords = countResult[0]?.totalRecords || 0;

    const totalOutstandingResult = await this.db.query(totalOutstandingSql, {
      type: Sequelize.QueryTypes.SELECT,
    });

    const revenue = await this.db.query(sql, {
      type: Sequelize.QueryTypes.SELECT,
    });

    return {
      result: revenue,
      totalPages: Math.ceil(totalRecords / perPage),
      year: year,
      currentPage: page,
      perPage: perPage,
      totalPaid: totalPaidResult[0]?.totalPaid || 0,
      totalOutstanding: totalOutstandingResult[0]?.totalOutstanding || 0,
      // count,
    };
  }

  async revenueReports(query) {}

  async ticketReport(query) {
    let perPage = 20; // number of records per page
    var page = query.page || 1;
    let offset = perPage * page - perPage;
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

    if (query.assessment_item)
      sql += ` AND revenue_invoices.taxpayer_name = '${query.assessment_item}'`;

    const totalRecordsQuery = await db.query(
      `
      SELECT COUNT(*) AS totalRecords
      FROM revenue_invoices
      LEFT JOIN _cities ON _cities.city_id = revenue_invoices.ward
      LEFT JOIN _streets ON _streets.idstreet = revenue_invoices.session_id
      WHERE revenue_invoices.service_id = ${query.service_id}
      ${
        query.from && query.to
          ? `AND STR_TO_DATE(revenue_invoices.payment_date, '%Y-%m-%d') BETWEEN '${query.from}' AND '${query.to}'`
          : ""
      }
      ${
        query.from
          ? `AND STR_TO_DATE(revenue_invoices.payment_date, '%Y-%m-%d') >= '${query.from}'`
          : ""
      }
      ${
        query.to
          ? `AND STR_TO_DATE(revenue_invoices.payment_date, '%Y-%m-%d') <= '${query.to}'`
          : ""
      }
      ${
        query.assessment_item
          ? `AND revenue_invoices.taxpayer_name = '${query.assessment_item}'`
          : ""
      }
    `,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const totalRecords = totalRecordsQuery[0].totalRecords;
    sql += ` LIMIT ${perPage} OFFSET ${offset}`;
    const result = await db.query(sql, { type: Sequelize.QueryTypes.SELECT });
    return {
      count: totalRecords,
      result,
      totalPages: Math.ceil(totalRecords / perPage),
      currentPage: page,
    };
  }

  async revenueInvoicesReport(query) {
    const perPage = 20; // Number of records per page
    const page = parseInt(query.page) || 1;
    const offset = perPage * (page - 1);
    const year = query.current_year
      ? query.current_year
      : new Date().getFullYear();

    //  where conditions
    const whereConditions = {
      service_id: query.service_id,
      ...(query.paid && { paid: query.paid }),
      ...(query.source && { source: query.source }),
      ...(query.business_building_name && {
        business_building_name: query.business_building_name,
      }),
    };

    //  paginated results and total count
    const [results, count] = await Promise.all([
      Revenues_invoices.findAll({
        where: whereConditions,
        limit: perPage,
        offset: offset,
      }),

      Revenues_invoices.count({
        where: whereConditions,
      }),
    ]);

    // Total Outstanding Amount
    const totalOutstandingResult = await Revenues_invoices.findAll({
      attributes: [
        [
          Sequelize.literal("SUM(amount - IFNULL(amount_paid, 0))"),
          "totalOutstanding",
        ],
      ],
      where: { service_id: query.service_id },
      raw: true,
    });

    // Total Paid Amount
    const totalPaid = await Revenues_invoices.sum("amount_paid", {
      where: { service_id: query.service_id },
    });

    return {
      results,
      currentPage: page,
      perPage,
      totalCount: count,
      totalPages: Math.ceil(count / perPage),
      totalPaid: totalPaid || 0,
      totalOutstanding: totalOutstandingResult[0]?.totalOutstanding || 0,
    };
  }

  async totalPaymentReport(service_id) {
    console.log({ service_id });
    const totalPaid = await Tax_items.sum("amount_paid", {
      where: {
        service_id: service_id,
        payment_status: 1,
      },
    });

    const totalOutstanding = await Tax_items.findAll({
      attributes: [
        [
          Sequelize.literal("SUM(amount - IFNULL(amount_paid, 0))"),
          "totalOutstanding",
        ],
      ],
      where: {
        service_id: service_id,
        payment_status: 0,
      },
      raw: true,
    });
    return {
      totalPaid: totalPaid || 0,
      totalOutstanding: totalOutstanding[0]?.totalOutstanding || 0,
    };
  }
}

module.exports = Reports;
