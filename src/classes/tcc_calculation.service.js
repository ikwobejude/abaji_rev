const Assessments = require("../model/Assessments");

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
        const startYear = parseInt(query.year, 10)
        const tin = query.tin

        const response = await this.findTaxPayerInvoices(tin, startYear);
        console.log(response)

    }

    async findTaxPayerInvoices(tin, yr) {
        // const start = yr;
        const inv = new Date().getTime().toString(36)
        const payload = []
        for (yr; yr < startYear + 3; yr++) {
            // const element = array[index];
            console.log(yr)
            const detail = await Assessments.findOne({ where: { tax_year: yr, tax_payer_rin: tin, settlement_status: 1 }, raw: true });
            payload.push[{
                assessment_amount: detail.assessment_amount,
                amount_paid: detail.assessment_amount_paid,
                yr,
                tin,
                batch: inv
            }]
            
        }

        return payload
    }


    
}

module.exports = new TCC()