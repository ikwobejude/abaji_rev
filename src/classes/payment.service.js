const sequelize = require("../db/connection");
const Api_Payments = require("../model/Api_payments");
const Assessments = require("../model/Assessments");
const Revenues_invoices = require("../model/Revenue_invoice");
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
           
            const assessments = await Assessments.findOne({ where: { invoice_number: query.reference }, raw: true })
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
            const assessments = await Assessments.findOne({ where: { invoice_number: query.reference }, raw: true })
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

    async settleIntoVariousRevenues(query) {

        const assessmentInvoice = await Revenue_upload.findOne({ where: { bill_ref_no: query.invoice }, raw: true})
        if(assessmentInvoice) {
            await this.clearApiPayment({
                PaymentLogId: new Date().getTime().toString(36),
                CustReference: assessmentInvoice.bill_ref_no,
                AlternateCustReference: assessmentInvoice.assessment_no,
                Amount: assessmentInvoice.grand_total,
                PaymentMethod: "Test Pay",
                PaymentReference: assessmentInvoice.biller_accountid,
                TerminalId: assessmentInvoice.biller_accountid,
                ChannelName: "PAY DEMO",
                CustomerName: assessmentInvoice.name_of_business,
                ReceiptNo: assessmentInvoice.bill_ref_no,
                CustomerAddress: assessmentInvoice.address_of_property,
                DepositorName: assessmentInvoice.assessment_no,
                DepositSlipNumber: assessmentInvoice.assessment_no,
                PaymentCurrency: "NGN",
                ItemAmount: assessmentInvoice.grand_total,
                locked: 1
            })
            await this.settleAssessmentItems(query.invoice)
            return this.settleAssessmentRevenue({...query, amount: assessmentInvoice.grand_total})
        } 

        const enumeratedInvoice = await Revenues_invoices.findOne({ where: {invoice_number: query.invoice }, raw: true})
        if(enumeratedInvoice) {
            await this.clearApiPayment({
                PaymentLogId: new Date().getTime().toString(36),
                CustReference: assessmentInvoice.invoice_number,
                AlternateCustReference: enumeratedInvoice.tin,
                Amount: enumeratedInvoice.amount,
                PaymentMethod: "Test Pay",
                PaymentReference: enumeratedInvoice.tin,
                TerminalId: enumeratedInvoice.ref_no,
                ChannelName: "PAY DEMO",
                CustomerName: enumeratedInvoice.name_of_business,
                ReceiptNo: enumeratedInvoice.invoice_number,
                CustomerAddress: enumeratedInvoice.address_of_property,
                DepositorName: enumeratedInvoice.ref_no,
                DepositSlipNumber: enumeratedInvoice.ref_no,
                PaymentCurrency: "NGN",
                ItemAmount: enumeratedInvoice.amount,
                locked: 1
            })
            await this.settleAssessmentItems(query.invoice)
            return this.settleEnumeratedRevenue({...query, amount: assessmentInvoice.grand_total})
        }

    }

    async settleAssessmentRevenue(query) {
        await Revenue_upload.update({
            payment_status: 1,
            invoice_status: 1,
            amount_paid: query.amount,
            payment_date: new Date()
        }, { where: { bill_ref_no: query.invoice }}, 
        {new: true})

        return {
            status: true,
            message: settled
        }
    }

    async settleEnumeratedRevenue(query) {
        await Revenues_invoices.update({
            paid: 1,
            amount_paid: query.amount,
            AmountDue: query.amount, 
            payment_date: new Date()
        }, { where: { bill_ref_no: query.invoice }}, 
        {new: true})

        return {
            status: true,
            message: settled
        }
    }

    async settleAssessmentItems(invoice_number) {
        const items = await Tax_items.findAll({ where: { invoice_number}, raw: true}) 

        for (const element of items) {
            await Tax_items.update({
                payment_status: 1,
                amount_paid: element.amount
            }, { where: {invoice_number}})
        }

        return 1
    }

    async clearApiPayment(query) {
        await this.api_payments.update({
            PaymentLogId: new Date().getTime().toString(36),
            CustReference: query.reference,
            AlternateCustReference: query.reference,
            Amount: query.amount,
            PaymentMethod: query.channel,
            PaymentReference: query.id,
            TerminalId: query.business_id,
            ChannelName: "PAY DEMO",
            CustomerName: assessments.name_of_business,
            ReceiptNo: assessments.bill_ref_no,
            CustomerAddress: assessments.address_of_property,
            DepositorName: query.customer_id,
            DepositSlipNumber: query.business_id,
            PaymentCurrency: query.currency,
            ItemAmount: query.amount,
            locked: 1
        }, { new: true },  { transaction: t })
    }
    
}

module.exports = SettlePayment