const { Op } = require("sequelize");
const db = require('../db/connection')
const Assessments = require("../model/Assessments");
const CertificateRequests = require("../model/CertificateRequests");
const certificateRequestsRecord = require("../model/certificateRequestsRecord");
const TaxPayers = require("../model/TaxPayers");

class TCC {

    /* Terms 
        Gross income (GI)
        Gross income (GI2) for consolidated relief allowance purposes (i.e. GI less pension)
        Less reliefs:
        Consolidated relief allowance
        Higher of NGN 200,000 or 1% of GI	200,000
    */

    PercentageCalculator(percentage, percentageAmount) {
        return (parseFloat(percentage)/100) * parseFloat(percentageAmount);
    }

    async individualTCC(amount) {
        const grossIncome = Number(amount);
        const allowance = 200000;
    
        // Calculate static relief (20% of gross income)
        const staticRelief =  this.PercentageCalculator(20, grossIncome);
    
        // Determine taxable income after static relief
        const taxableIncome = grossIncome - staticRelief;
    
        // Calculate consolidation relief (max of 1% of taxable income or allowance)
        const onePercentOfTaxableIncome =  this.PercentageCalculator(1, taxableIncome);
        const consolidationRelief = Math.max(onePercentOfTaxableIncome, allowance);
    
        // Calculate income subject to tax after reliefs
        const incomeForTax = taxableIncome - consolidationRelief;
    
        // Initialize tax calculation variables
        let remainingIncome = incomeForTax;
        let totalTaxPayable = 0;
    
        // Define tax brackets
        const taxBrackets = [
            { limit: 300000, rate: 7 },
            { limit: 300000, rate: 11 },
            { limit: 500000, rate: 15 },
            { limit: 500000, rate: 19 },
            { limit: 1600000, rate: 21 },
            { limit: Infinity, rate: 24 },
        ];
    
        // Calculate tax for each bracket
        for (const { limit, rate } of taxBrackets) {
            if (remainingIncome <= 0) break;
    
            // Determine taxable amount within the bracket
            const taxableAmount = Math.min(remainingIncome, limit);
    
            // Calculate tax for the current bracket
            const taxForBracket = this.PercentageCalculator(rate, taxableAmount);
    
            // Add to total tax and reduce remaining income
            totalTaxPayable += taxForBracket;
            remainingIncome -= taxableAmount;
        }
    
        // Return the total tax payable rounded to two decimal places
        return totalTaxPayable.toFixed(2);
    }

    async individualTCC1 (data){
        const amount = Number(data);
        const allowance = 200000;
        const staticRelief = this.PercentageCalculator(20, amount);
        const TaxableIncome = amount - staticRelief
        const onePercentOfGI =  this.PercentageCalculator(1, TaxableIncome);
        const consolidationRelief = onePercentOfGI > allowance ? onePercentOfGI : allowance;
        const GI = TaxableIncome - consolidationRelief;
        let balance = 0;
        let total = 0;
        for (let i = 1; i <= 6; i++) {
            let taxPayable = 0;
            if(i == 1){
                if(GI > 0){
                    const computableAmount = amount >= 300000 ? 300000 : amount
                    taxPayable +=  this.PercentageCalculator(7, computableAmount);
                    balance = GI - 300000;
                } else {
                    break;
                }
            } else if(i == 2){
                if(balance > 0){
                    const computableAmount = balance >= 300000 ? 300000 : balance
                    taxPayable +=  this.PercentageCalculator(11, computableAmount);
                    balance = balance - 300000;
                } else {
                    break;
                }
            } else if(i == 3){
                if(balance > 0){
                    const computableAmount = balance >= 500000 ? 500000 : balance
                    taxPayable +=  this.PercentageCalculator(15, computableAmount);
                    balance = balance - 500000;
                } else {
                    break;
                }
            } else if (i == 4){
                if(balance > 0){
                    // console.log(balance)
                    const computableAmount = balance >= 500000 ? 500000 : balance;
                    taxPayable +=  this.PercentageCalculator(19, computableAmount);
                    balance = balance - 500000;
                   
                } else {
                    console.log("break")
                    break;
                }
            } else if (i == 5){
                if(balance > 0){
                    const computableAmount = balance >= 1600000 ? 1600000 : balance
                    taxPayable +=  this.PercentageCalculator(21, computableAmount);
                    balance = balance - 1600000;
                } else {
                    break;
                }
            } else {
                if(balance > 0){
                    const computableAmount = balance >= 320000 ? 320000 : balance
                    taxPayable +=  this.PercentageCalculator(24, computableAmount);
                } else {
                    break;
                }
            }
            total += taxPayable
        } 
        return parseFloat(total).toFixed(2) 
    }

    async generateTCC(query) {
        const startYear = parseInt(query.tcc_start_year, 10);
        const tin = query.tcc_taxpayer_tin;
        const inv = new Date().getTime().toString(36); // Unique batch identifier
    
        const t = await db.transaction();

        try {
            // Create a Certificate Request record
            await CertificateRequests.create({
                taxpayer_name: query.tcc_taxpayer_name,
                service_id: query.service_id,
                taxpayer_id: tin,
                request_date: new Date(),
                start_year: startYear,
                end_year: startYear + 2,
                batch: inv
            }, { transaction: t });
        
            // Fetch taxpayer invoices for the given years
            const response = await this.findTaxPayerInvoices(tin, startYear, query.service_id, inv);
            console.log(response);
        
            // If invoices are found, bulk insert them into certificateRequestsRecord
            if (response.count > 0) {
                await certificateRequestsRecord.bulkCreate(response.payload, { ignoreDuplicates: true }, { transaction: t });
            }
            await t.commit()
        
            // Return status and message
            return {
                status: response.count > 0,
                message: response.count > 0 
                    ? `Successfully generated` 
                    : `No tax found for the year ${startYear} - ${startYear + 2}`,
            };
        } catch (error) {
            console.log(error)
            await t.rollback()
            throw error(error.message)
        }
    }
    
    async findTaxPayerInvoices(tin, startYear, service_id, inv) {
       
        const payload = [];
        let count = 0;
    
        // Fetch all assessments for the given taxpayer and year range in a single query
        const details = await Assessments.findAll({
            where: {
                tax_payer_rin: tin,
                settlement_status: 1,
                tax_year: {
                    [Op.between]: [startYear, startYear + 2],
                },
            },
            raw: true,
        });
    
        // Process the fetched assessments
        for (let year = startYear; year <= startYear + 2; year++) {
            const detail = details.find((d) => d.tax_year === year);
            if (detail) count++;
            payload.push({
                tax_payable: detail ? detail.assessment_amount : 0,
                total_profit: detail ? detail.assessment_amount_paid : 0,
                year: year,
                tin,
                batch: inv,
                service_id
            });
        }
    
        return { payload, count };
    }


    async findAll(query) {
        console.log({query})
        let perPage = 10; // number of records per page
        var page = query.page || 1;
        let offset = perPage * page - perPage;

        const conditions = {
            service_id: query.service_id, // Always include service_id
            [Op.and]: [
                query.taxpayer_name ? { taxpayer_name: query.taxpayer_name } : null,
                query.start_year ? { start_year: query.start_year } : null,
                query.taxpayer_id ? { taxpayer_id: query.taxpayer_id } : null,
            ].filter(Boolean), // Filter out empty or null conditions
        };

        const [results, count] = await Promise.all([
            CertificateRequests.findAll({
                where: conditions,
                limit: perPage,
                offset: offset,
                raw: true,
            }),
            CertificateRequests.count({
                where: conditions,
                limit: perPage,
                offset: offset,
                raw: true,
            })      
        ])

        return {
            results,
            count,  
        };
        
    }
    


    
}

module.exports = new TCC()