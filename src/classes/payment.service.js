const sequelize = require("../db/connection");
const Api_Payments = require("../model/Api_payments");
const Revenue_upload = require("../model/Revenue_upload");
const Tax_items = require("../model/Tax_items");


class SettlePayment {
    constructor() {
        this.api_payments = Api_Payments;
        this.assessments = Revenue_upload;
        this.assessment_items = Tax_items;
        this.db = sequelize
    }

    async settle_into_api_payment(data, t) {
        const query = data.data;
        const payment = await this.api_payments.findOne({ where: {CustReference: query.reference}, raw: true });
        if(payment){
           
            const assessments = await this.assessments.findOne({ where: { biller_accountid: query.reference }, raw: true })
            return await this.api_payments.update({
                PaymentLogId: query.id,
                CustReference: query.reference,
                AlternateCustReference: query.reference,
                Amount: query.amount,
                PaymentMethod: query.channel,
                PaymentReference: query.id,
                TerminalId: query.business_id,
                ChannelName: "BUDPAY",
                CustomerName: assessments.name_of_business,
                ReceiptNo: assessments.bill_ref_no,
                CustomerAddress: assessments.address_of_property,
                DepositorName: query.customer_id,
                DepositSlipNumber: query.business_id,
                PaymentCurrency: query.currency,
                ItemAmount: query.amount,
                locked: 1
            }, { new: true },  { transaction: t })
            
        } else {
            const assessments = await this.assessments.findOne({ where: { biller_accountid: query.reference }, raw: true })
            return await this.api_payments.create({
                PaymentLogId: query.id,
                CustReference: query.reference,
                AlternateCustReference: query.reference,
                Amount: query.amount,
                PaymentMethod: query.channel,
                PaymentReference: query.id,
                TerminalId: query.business_id,
                ChannelName: "BUDPAY",
                CustomerName: assessments.name_of_business,
                ReceiptNo: assessments.bill_ref_no,
                CustomerAddress: assessments.address_of_property,
                DepositorName: query.customer_id,
                DepositSlipNumber: query.business_id,
                PaymentCurrency: query.currency,
                ItemAmount: query.amount,
                locked: 1
            }, { transaction: t })
        }
    }

    async settle_into_revenue_assessment(data, t) {
        const query = data.data;
        return await this.assessments.update({
            payment_date: new Date(),
            amount_paid: query.amount,
            payment_status: 1
        }, { where: { biller_accountid: query.reference }},
        {new: true},
        {transaction : t})
    }

    async settle_into_assessment_item(data, t) {
        const query = data.data;
        const assessment = await this.assessments.findOne({ where: { biller_accountid: query.reference  }, raw: true})
        return await this.assessment_items.update({
            payment_date: new Date(),
            amount_paid: query.amount,
            payment_status: 1
        }, { where: { invoice_number: assessment.bill_ref_no }},
        {new: true},
        {transaction : t})
    }

    async settle_payment(data) {
        try {
            const t = await this.db.transaction();
            try {
                await this.settle_into_api_payment(data, t)
                await this.settle_into_revenue_assessment(data, t)
                await this.settle_into_assessment_item(data, t)

                await t.commit()
                return true
            } catch (error) {
                await t.rollback()
                throw error
            }
        } catch (error) {
            throw error
        }
    }
}

module.exports = SettlePayment