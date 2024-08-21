const eventEmitter = require('node:events')
const xml2js = require('xml2js')
const Sequelize = require('sequelize');
const db = require('../db/connection')
const Revenue_upload = require('../model/Revenue_upload');
const Api_Payments = require('../model/Api_payments');
const Revenues_invoices = require('../model/Revenue_invoice');
const Tax_items = require('../model/Tax_items');
const Op = Sequelize.Op;

// const parser = new xml2js.Parser(/* options */);    

class InterSwitch extends eventEmitter {
    constructor() {
        super()
        this.revenue_uploads = Revenue_upload;
        this.api_payments = Api_Payments;
        this.revenues_invoices = Revenues_invoices;
        this.year = new Date().getFullYear();
        this.db = db;
        this.tax_items = Tax_items
    }

    // parser(){
    //     return 
    // }

    initInterSwitch(rawBody, service_id) {
        const parser = new xml2js.Parser(/* options */); 
        parser.parseStringPromise(rawBody).then(async (result) => {
            // console.log(result.CustomerInformationRequest)
            if(result.CustomerInformationRequest) {
                const MCode = result.CustomerInformationRequest.MerchantReference[0];
                const customerReference = result.CustomerInformationRequest.CustReference[0]
                if(MCode == process.env.MID) {
                    const response = await this.customerValidation(customerReference);
                    this.emit("customer-validation", response)
                    // console.log({jk: result})
                    // return result;
                } else {
                    const response = {
                        CustomerInformationResponse: {
                            MerchantReference: result.CustomerInformationRequest.MerchantReference,
                            Customers: {
                                Customer: {
                                    Status: 1,
                                    CustReference: '',
                                    CustomerReferenceAlternate: '',
                                    FirstName: '',
                                    LastName: '',
                                    OtherName:'',
                                    Email: '',
                                    Phone: '',
                                    ThirdPartyCode: '',
                                    Amount: ''
                                }
                            }
                        }
                    }
                    return response
                }

            }

            if(result.PaymentNotificationRequest){
                const payment = await this.paymentNotification(result.PaymentNotificationRequest);
                this.emit("payment-notification", payment)
                
            }
        })
    }


    async customerValidation(ref_no) {

        // console.log({ref_no})
        
        if(ref_no) {
            
            const assessment = await this.revenue_uploads.findOne({
                where: {
                    [Op.or]: [
                        { bill_ref_no: ref_no },
                        { biller_accountid: ref_no },
                        { assessment_no : ref_no}
                    ]
                }
            });
            // console.log("Hi")
            // console.log({assessment})
            if(!assessment){
                const revenue = await this.revenues_invoices.findOne({
                    where: {
                        [Op.or]: [
                            { invoice_number: ref_no },
                            { tin: ref_no }
                        ]
                    },
                    raw: true
                })
                // console.log(revenue)
                if(revenue){
                    const obj = {
                        CustomerInformationResponse: {
                            MerchantReference: process.env.MID,
                            Customers: {
                                Customer: {
                                    Status: 0,
                                    CustReference: revenue.invoice_number,
                                    CustomerReferenceAlternate: '',
                                    FirstName: revenue.taxpayer_name,
                                    LastName: '',
                                    OtherName:'',
                                    Email: '',
                                    Phone: '',
                                    ThirdPartyCode: '',
                                    Amount: 0
                                    // parseFloat(revenue.amount)
                                }
                            }
                        }
                    }

            
                    return obj;
                } else {
                    const obj = {
                        CustomerInformationResponse: {
                            MerchantReference: process.env.MID,
                            Customers: {
                                Customer: {
                                    Status: 1,
                                    CustReference: ref_no,
                                    CustomerReferenceAlternate: '',
                                    FirstName: '',
                                    LastName: '',
                                    OtherName:'',
                                    Email: '',
                                    Phone: '',
                                    ThirdPartyCode: '',
                                    Amount: ''
                                }
                            }
                        }
                    }
                    return obj
                }
            } else {
                const obj = {
                    CustomerInformationResponse: {
                        MerchantReference: process.env.MID,
                        Customers: {
                            Customer: {
                                Status: 0,
                                CustReference: assessment.bill_ref_no,
                                CustomerReferenceAlternate: '',
                                FirstName: assessment.name_of_business,
                                LastName: '',
                                OtherName:'',
                                Email: '',
                                Phone: '',
                                ThirdPartyCode: '',
                                Amount: 0
                                // parseFloat(assessment.grand_total - assessment.goodwill)
                            }
                        }
                    }
                }

                console.log({obj})
        
                return obj;
            }
        } else {
            const obj = {
                CustomerInformationResponse: {
                    MerchantReference: mcode,
                    Customers: {
                        Customer: {
                            Status: 1,
                            CustReference: ref_no,
                            CustomerReferenceAlternate: '',
                            FirstName: '',
                            LastName: '',
                            OtherName:'',
                            Email: '',
                            Phone: '',
                            ThirdPartyCode: '',
                            Amount: ''
                        }
                    }
                }
            }
            return obj
        }
    }

    async paymentNotification(data) {
        const Payments = data.Payments[0].Payment[0];
        // console.log({Payments})
    
        const t = await this.db.transaction();
        try {
            if(parseFloat(Payments.Amount[0]) <= 0.00 || Payments.Amount[0] == "") {
                const obj = {
                    PaymentNotificationResponse: {
                        Payments: {
                            Payment: {
                                PaymentLogId: Payments.PaymentLogId[0],
                                Status: 1
                            }
                        }
                    }
                }
                // console.log(obj)
                return obj;
            } else {
                const assessment = await this.revenue_uploads.findOne({
                    where: {
                        [Op.or]: [
                            { bill_ref_no: Payments.CustReference[0] },
                            { biller_accountid: Payments.CustReference[0] },
                            { assessment_no : Payments.CustReference[0]}
                        ]
                    },
                    raw:true
                });
        
                // console.log({assessment})
                if(assessment) {
                   
                     await this.clearApiPayment(Payments, t)
                     const obj = await this.clearAssessmentPayment(assessment, Payments, t)
                     await t.commit();
                     return  obj   
                       
                } else {
                    const uploaded = await this.revenueModels.RevenuesInvoices.findOne({
                        where: {
                            invoice_number: Payments.CustReference[0], 
                            year: this.year
                        },
                        raw: true
                    })
                    // console.log({uploaded}, this.year)
                    // return
                    if(uploaded){
                        const payment = await this.clearApiPayment(Payments, t)
                        const obj = await this.clearRevenueInvoicesPayments(uploaded, Payments, t)
                        await t.commit();
                        return obj;
                    } else {
                        const obj = {
                            PaymentNotificationResponse: {
                                Payments: {
                                    Payment: {
                                        PaymentLogId: Payments.PaymentLogId[0],
                                        Status: 1
                                    }
                                }
                            }
                        }
                        return obj;
                    }
                }
            }
        } catch (error) {
            console.log(error)
            await t.rollback();
            const obj = {
                PaymentNotificationResponse: {
                    Payments: {
                        Payment: {
                            PaymentLogId: Payments.PaymentLogId[0],
                            Status: 1
                        }
                    }
                }
            }

            this.emit("custom-error", obj)
            // return obj;
        }
       
    }

    async clearApiPayment(Payments, t) {
        // console.log({Payments});
        return await this.api_payments.create( {
            PaymentLogId: Payments ? Payments.PaymentLogId[0] : '',
            CustReference: Payments ? Payments.CustReference[0] : '',
            AlternateCustReference: Payments ? Payments.AlternateCustReference[0]: '',
            Amount: Payments ?  Payments.Amount[0]: '',
            PaymentMethod: Payments ? Payments.PaymentMethod[0]: '',
            PaymentReference: Payments ? Payments.PaymentReference[0]: '',
            TerminalId: Payments ? Payments.PaymentLogId[0]: '',
            ChannelName: Payments ? Payments.ChannelName[0]: '',
            Location: Payments ? Payments.Location[0]: '',
            PaymentDate: new Date(),
            SettlementDate: Payments ? Payments.SettlementDate[0]: '',
            InstitutionId: Payments ? Payments.InstitutionId[0]: '',
            InstitutionName: Payments ? Payments.InstitutionName[0]: '',
            BranchName: Payments ? Payments.BranchName[0]: '',
            BankName: Payments ? Payments.BankName[0]: '',
            OtherCustomerInfo: Payments ? Payments.OtherCustomerInfo[0]: '',
            ReceiptNo: Payments ? Payments.ReceiptNo[0]: '',
            CollectionsAccount: Payments ? Payments.CollectionsAccount[0]: '',
            BankCode: Payments ? Payments.BankCode[0]: '',
            // ServiceUrl: data.ServiceUrl[0],
            // FtpUrl: data.FtpUrl[0],
            // IsRepeated: Payments.IsRepeated[0],
            DepositSlipNumber: Payments.ProductGroupCode[0],
            // tax_office_id: assessment.tax_office_id,
            // CustomerName: assessment.bill_ref_no
        }, {transaction: t});
       
    }

    async clearAssessmentPayment(assessment, Payments, t) {
        const dt = assessment;
        const outstanding = parseFloat(assessment.grand_total - assessment.amount_paid);
        const previousAmount = parseFloat(assessment.amount_paid);
        const amountPaid = parseFloat(Payments.Amount[0]);
        // const amountPaid = parseFloat(dt.amount_paid) + parseFloat(Payments.Amount[0]) ;
        const disc = parseFloat(dt.grand_total) - parseFloat(dt.goodwill);

        if(amountPaid >= outstanding) {
          
                
            const prevP = previousAmount + parseFloat(Payments.Amount[0]);
            await this.revenueModels.Revenue_upload.update(
                {amount_paid: prevP, payment_status:1, payment_date:new Date()}, 
                {where: {bill_ref_no: Payments.CustReference[0], rate_year: currentYear}}, 
                {new:true});
            // await db.query(`UPDATE tax_items SET payment_status = 1 WHERE invoice_number = '${Payments.CustReference[0]}'`, {type: Sequelize.QueryTypes.UPDATE});

            const taxItems = await this.tax_items.findAll({
                where: {
                    invoice_number: Payments.CustReference[0],
                    payment_status: [0,2]
                },
                raw:true
            });

            // console.log(taxItems)

            for (const m of taxItems) {
                const taxUpdate = {
                    payment_status: 1,
                    amount_paid: parseFloat(m.amount) - parseFloat(m.discount)
                }
                await this.tax_items.update(taxUpdate, {
                    where: {
                        id: m.id
                    }}, 
                    {new:true});
            }
            // await t.commit()
            let obj = {
                PaymentNotificationResponse: {
                    Payments: {
                        Payment: {
                            PaymentLogId: Payments.PaymentLogId[0],
                            Status: 0
                        }
                    }
                }
            }


            return obj;
          
        } 

        if(amountPaid < outstanding) {
                console.log(amountPaid, "pathpayment")
                const prevP = previousAmount + parseFloat(Payments.Amount[0]);
                await this.revenue_uploads.update({amount_paid: prevP, payment_status:2, payment_date: new Date() }, {where: {bill_ref_no: Payments.CustReference[0], rate_year: this.year}}, {new:true});
                const taxItems = await this.tax_items.findAll({
                    attributes: ['id', 'amount', 'amount_paid', 'invoice_number', 'payment_status', 'discount'],
                    where: {
                        invoice_number: Payments.CustReference[0],
                        payment_status: [0,2]
                    },
                    raw:true
                });
    
                let deductAble = parseFloat(Payments.Amount[0]);
                for (const m of taxItems) {
                    const itemOutstanding = parseFloat(m.amount - m.amount_paid);
                    let amt = deductAble > itemOutstanding ? deductAble - itemOutstanding :  deductAble;
                    console.log({amt, itemOutstanding})
        
                    const paymentStatus = deductAble >= itemOutstanding ? 1 :  2
                    const taxUpdate = {
                        payment_status:  paymentStatus,
                        amount_paid: paymentStatus == 1 
                        ? parseFloat(itemOutstanding) + parseFloat(m.amount_paid) 
                        : parseFloat(deductAble) + parseFloat(m.amount_paid)
                    }
                    
                    await this.tax_items.update(taxUpdate, {
                        where: {
                            id: m.id
                        }}, 
                        {new:true}
                    );
    
                    // console.log(taxUpdate)
                    deductAble = amt;
                }
                let obj = {
                    PaymentNotificationResponse: {
                        Payments: {
                            Payment: {
                                PaymentLogId: Payments.PaymentLogId[0],
                                Status: 0
                            }
                        }
                    }
                }
                return obj;
            
        }
    }

    async clearRevenueInvoicesPayments(uploaded, Payments, t) {
        const assessment = uploaded;
        const outstanding = parseFloat(assessment.amount - assessment.amount_paid);
        const previousAmount = parseFloat(assessment.amount_paid);
        const amountPaid = parseFloat(Payments.Amount[0]);

        console.log({outstanding, previousAmount, amountPaid})
        
            // console.log({ outstanding, previousAmount, amountPaid, data });
            // return;
            if (amountPaid >= outstanding) {
              const prevP = previousAmount + parseFloat(Payments.Amount[0]);
              await this.revenues_invoices.update(
                {
                  paid: 1,
                  // invoice_status: 1,
                  amount_paid: prevP,
                  payment_date: new Date(),
                },
                { where: { invoice_number: Payments.CustReference[0] } },
                { transaction: t }
              );
            
              const taxItems = await this.db.query(`
              SELECT * FROM tax_items WHERE invoice_number= '${Payments.CustReference[0]}' AND (tax_items.payment_status = 0 OR tax_items.payment_status = 2)`, {type: Sequelize.QueryTypes.SELECT});
            //   console.log(data.bill_ref_no, taxItems)
              // return
              for (const m of taxItems) {
                const taxUpdate = {payment_status: 1, amount_paid: parseFloat(m.amount) - parseFloat(m.discount),};
                await this.tax_items.update(
                  taxUpdate,
                  {
                    where: {
                      id: m.id,
                    },
                  },
                  { new: true },
                  { transaction: t }
                );
              }
        
              let obj = {
                    PaymentNotificationResponse: {
                        Payments: {
                            Payment: {
                                PaymentLogId: Payments.PaymentLogId[0],
                                Status: 0
                            }
                        }
                    }
                }
              return obj;
            }
        
            if (amountPaid < outstanding) {
             
              console.log("Part Payment")
              
              const amountAfterPayment = outstanding - amountPaid;
              console.log({amountPaid, outstanding, amountAfterPayment})
              // return;
             
        
              await this.db.query(`
              UPDATE revenue_invoices SET  
              paid = 2,  
              amount_paid = ${previousAmount + amountPaid},
              payment_date= CURRENT_DATE() 
              where invoice_number= '${Payments.CustReference[0]}'
              `,  
              { transaction: t }, 
              {type: Sequelize.QueryTypes.UPDATE})
             
              // console.log({amount_paid: previousAmount + amountPaid})
        
             
              const taxItems = await this.db.query(`
              SELECT * FROM tax_items WHERE invoice_number= '${data.bill_ref_no}' AND (tax_items.payment_status = 0 OR tax_items.payment_status = 2)`, {type: Sequelize.QueryTypes.SELECT});
        
              // console.log(taxItems);
        
              let deductAble = amountPaid;
              for (const m of taxItems) {
                const itemOutstanding = parseFloat(m.amount - m.amount_paid);
                let amt = deductAble > itemOutstanding ? deductAble - itemOutstanding : deductAble;
                console.log({ amt, itemOutstanding });
        
                const paymentStatus = deductAble >= itemOutstanding ? 1 : 2;
                const taxUpdate = {
                  payment_status: paymentStatus,
                  amount_paid: paymentStatus == 1 ? parseFloat(itemOutstanding) + parseFloat(m.amount_paid) : parseFloat(deductAble) + parseFloat(m.amount_paid),
                };
        
                await this.tax_items.update(
                  taxUpdate,
                  {
                    where: {
                      id: m.id,
                    },
                  },
                  { new: true },
                  { transaction: t }
                );
        
                // console.log(taxUpdate)
                deductAble = amt;
              }
      
               return ;
             
            }
          
    }


}


module.exports = InterSwitch;

