const Sequelize = require('sequelize')
const db = require('../db/connection');
const Api_Payments = require('../model/Api_payments');
const Revenue_upload = require('../model/Revenue_upload');
const RevenuesInvoices = require('../model/RevenueInvoice');
const Tax_items = require('../model/Tax_items');
const Transaction = require('../model/Transaction');
const wallet = require('../model/Wallet');
const WalletTransaction = require('../model/WalletTransaction');
const Op = Sequelize.Op;

// await tickets
class Wallet {
    constructor() {
        this.walletTransaction = WalletTransaction;
        this.transaction = Transaction;
        this.wallet = wallet
        this.revenuesInvoices = RevenuesInvoices
        this.revenue_upload = Revenue_upload
        this.api_payments = Api_Payments
        this.tax_items = Tax_items
        this.db = db
    }

     // Record wallet history
    async walletHistory(data, wallet, t) {
        return await this.walletTransaction.create(
            {
              userId: data.id,
              isInflow: 2,
              paymentMethod: "Cash",
              currency: "NGN",
              amount: data.amount,
              walletid: wallet.idwallent,
              transactionid: data.invoice,
              // created_on: ,
              status: "successful",
            },
            { transaction: t }
          );
    }
    // perform wallet transactions
    async walletTransaction(data, t) {
        return await this.transaction.create(
            {
              userId: data.id,
              name: data.name,
              isInflow: 2,
              transactionId: data.invoice,
              amount: data.amount_paid,
              currency: "NGN",
              paymentStatus: "successful",
              paymentGateway: "AGENT",
              description: data.tdescription,
              topitby: data.id,
            },
            { transaction: t }
          );
    }

    async UserWallet(userId) {
        // console.log(userId)
        const wallet = await this.wallet.findOne({
            where: { 
                userId: userId 
            },
            raw: true
        })

        console.log(wallet)
        if(wallet) {
            if(parseFloat(wallet.balance) > 0) {
                return {
                    status: true,
                    ...wallet
                }
            } else {
                throw Error('You have zero in your wallet')
                // return {
                //     status: false,
                //     message: 'You have zero in your wallet'
                // }
            }
        } else {
            return { status: false, message: "Wallet not found" }
        }
    }
    // await Revenue_upload
    async makeWalletAssessmentPayment(data) {
        const revInfo = await this.revenue_upload.findOne({
            attributes: ["name_of_business"],
            where: { bill_ref_no: data.invoice },
            raw: true
        })

       
        const wallet = await this.UserWallet(data.id)
        // console.log({wallet})
        const walletBalance = parseFloat(wallet.balance) - parseFloat(data.amount_paid);
        console.log({walletBalance})
        await this.wallet.update({balance: walletBalance }, {where: {
            walletid: wallet.walletid
        }}, {raw: true})

        const t = await this.db.transaction()

        try {
            await this.walletHistory(data, wallet, t);
            new this.walletTransaction({...data, name: revInfo.name_of_business}, t);
            const data1 = {
                bill_ref_no: data.invoice,
                amount: parseFloat(data.amount_paid),
                service_id: data.service_id,
                AlternateCustReference: new Date().getTime().toString(36) +"_" +(Date.now() + Math.random().toString()).split(".").join("_"),
                PaymentReference: data.invoice,
                AlternateCustReference: new Date().getTime().toString(36),
            }
            const payment = await this.clearRevenueUploadPayment({...data, ...data1}, t)
            await t.commit();
            return {
                status: true,
                message: "Payment successful",
                payment: payment.toJSON()
            }
        } catch (error) {
            console.log(error)
            await t.rollback()
            throw Error(error.message)
            
        }

    }

    async makeWalletEnumerationPayment(data) {
        const revInfo = await this.revenuesInvoices.findOne({
            attributes: [["taxpayer_name", "name_of_business"]],
            where: {
              invoice_number: data.bill_ref_no
            },
            raw:true
          })

        const wallet = await this.UserWallet(data.id)

        const walletBalance = parseFloat(wallet.balance) - parseFloat(data.amount);
        await this.wallet.update({balance: walletBalance }, {where: {
            walletid: wallet.walletid
        }}, {raw: true})

        const history = await this.walletHistory(data, wallet);
        const transactions = await this.walletTransaction({...data, name: revInfo.name_of_business});

        return {
            ...history, ...transactions
        }
    }

    async makeWalletSinglePayment() {
        let attributes = await this.tickets.findOne({
            attributes: [["agent_name", "name_of_business"]],
            where: {
              invoice_number: data.bill_ref_no 
            },
            raw: true
          })

        const wallet = await this.UserWallet(data.id)
          console.log(wallet, "Hello");
        //   return
        const walletBalance = parseFloat(wallet.balance) - parseFloat(data.amount);
        await this.wallet.update({balance: walletBalance }, {where: {
            walletid: wallet.walletid
        }}, {raw: true})

        const history = await this.walletHistory(data, wallet);
        const transactions = await this.walletTransaction({...data, name: revInfo.name_of_business});

        return {
            ...history, ...transactions
        }
    }

    async makeBulkWalletPayment(data) {
        let ticket = await this.tickets.findOne({
            where: {
                batch: data.batch
            },
            limit: 1,
            raw: true
          })

        const wallet = await this.UserWallet(data.id)
        // console.log({wallet})
        const amountPaid = parseFloat(ticket.amount) * parseFloat(data.number_of_ticket);
        const payload = {
            id: data.id,
            amount: amountPaid,
            idwallent: wallet.idwallent,
            bill_ref_no: data.batch,
            name: data.name,
            tdescription: "TICKET BULK PAYMENT"
        }
        // console.log(wallet, "Amount");
        if(wallet.status == false) return wallet
        if(amountPaid > wallet.balance) return { status: false, message: "You don't have sufficient balance to perform this transaction" }
        const walletBalance = parseFloat(wallet.balance) - parseFloat(amountPaid);
        // console.log(wallet.balance, amountPaid);
       

        // return clr
        const t = await this.db.transaction();
        try {
            await this.wallet.update({balance: walletBalance}, {where: {
                walletid: wallet.walletid
            }}, {raw: true}, { transaction: t })
    
            const history = await this.walletHistory(payload, t);
            const transactions = await this.walletTransaction({payload, revHead: ticketD[0]}, t);
            // const clr = await this.clearTicket({
            //     number_of_ticket: data.number_of_ticket, 
            //     batch: data.batch, 
            //     amount:ticket.amount}, t);
           
            await t.commit()
      
            return {
                status: true,
                message: "payment successful",
                number_of_ticket_paid: data.number_of_ticket,
                amount_paid: ticket.amount,
                ...history, ...transactions
            }
        } catch (error) {
            await t.rollback()
            return {
                status: false,
                message: error.message
            }
        }
       
    }

    async clearTicket(data, t) {
        // console.log(ticket, batch)
        const tickets = await this.tickets.findAll({
            attributes: ['id'],
            where: {
                batch: data.batch.toUpperCase(),
                payment_status: 0
            },
            raw: true
        })

        // console.log(tickets.length)
        if(data.number_of_ticket > tickets.length) return {status: false, message: 'Number of ticket to be paid, must be less or equal to generated!'}

        let ids = [];
        for (let i = 0; i < data.number_of_ticket; i++) {
            ids.push(tickets[i].id)
        }

        // console.log(ids)

       const done = await this.basicModel.tickets.update({
            payment_status : 1,
            amount_paid: data.amount,
            payment_date: new Date()
        }, {where: {id: ids}}, {transaction: t})
        return done
       
    }

    async walletBalance(userId) {
        try {
            const result = await this.wallet.findOne({
                where: { userId }, // Shorthand for { userId: userId }
                raw: true, // Good practice for simpler object access
            });
    
            if (result) {
                const balance = parseFloat(result.balance); // Parse once
                if (isNaN(balance)) { // Check if parsing failed
                    console.error(`Invalid balance value for userId ${userId}:`, result.balance);
                    return {
                        status: false,
                        message: "Invalid wallet balance data. Contact system admin."
                    };
                }
    
                return {
                    status: true,
                    balance: balance.toFixed(2), // Format the balance after parsing
                    walletId: result.idwallent,
                };
            } else {
                return {
                    status: false,
                    message: "No wallet found for this user." // More user-friendly message
                };
            }
        } catch (error) {
            console.error("Error fetching wallet balance:", error); // Log the actual error
            return {
                status: false,
                message: "Error fetching wallet balance. Please try again later." // Generic message for the user
            };
        }
    }


    async walletBalance(userId) {
        const result = await this.wallet.findOne({
            where: {
                userId: userId
            },
            raw: true
        })

        // console.log(result.balance)
        if(result) {
            return {
                status: true,
                balance: parseFloat(result.balance).toFixed(2),
                walletId: result.idwallent,
            }
        } else {
            throw Error("No wallet found, contact the system admin for help")
        }
        
    }


    async clearRevenueUploadPayment(data, t) {
        // console.log({data})
        // return
        let assessment = await this.revenue_upload.findOne({where: {bill_ref_no:  data.invoice }, raw:true})
        // console.log(assessment)
        const outstanding = parseFloat(assessment.grand_total - assessment.amount_paid);
        const previousAmount = parseFloat(assessment.amount_paid);
        const amountPaid = parseFloat(data.amount);
        console.log({outstanding, previousAmount, amountPaid})
        // return
        if(amountPaid >= outstanding) {
            const newPayment = previousAmount + parseFloat(data.amount);
            this.revenue_upload.update(
                {payment_status: 1,invoice_status: 1,invoice: data.invoice,amount_paid:  newPayment,payment_date:  new Date()}, 
                {where: {bill_ref_no: data.invoice }}, 
                {transaction: t}
            )
            const payment =  await this.api_payments.create({
                PaymentLogId: new Date().getTime().toString(36) ,
                service_id: data.service_id,
                CustReference: data.invoice,
                AlternateCustReference:  data.AlternateCustReference,
                Amount:  data.amount,
                PaymentMethod:"AGENT", 
                PaymentReference: data.PaymentReference,
                ChannelName: "cash",
                PaymentDate: new Date(),
                BankName: "",
                CustomerName: data.customerName,
                BankCode: "",
                PaymentCurrency: "NGN",
                invoice_no: data.AlternateCustReference,
                sources: "OFFLINE"
            }, {transaction: t})
            const taxItems = await this.tax_items.findAll({
                where: {
                    invoice_number: data.invoice,
                    [Op.or]: {
                        payment_status: 0,
                        payment_status: 2
                    }
                },
                raw:true
            });

            for (const m of taxItems) {
                const taxUpdate = {
                    payment_status: 1,
                    amount_paid: parseFloat(m.amount) - parseFloat(m.discount)
                }
                await this.tax_items.update(taxUpdate, 
                    {
                        where: {
                            id: m.id
                        }
                    }, 
                    {new:true}, 
                    {transaction: t}
                );
            }

            return payment;
        }

        if(amountPaid < outstanding) {
            // console.log(data)
            const amountAfterPayment = outstanding - amountPaid;
            // console.log({amountPaid, outstanding, amountAfterPayment})
            const payment =  await this.api_payments.create({
                PaymentLogId: new Date().getTime().toString(36),
                service_id: data.service_id,
                CustReference: data.invoicee,
                AlternateCustReference:  data.AlternateCustReference,
                Amount:  data.amount,
                PaymentMethod:"AGENT", 
                PaymentReference: data.PaymentReference,
                ChannelName: "cash",
                PaymentDate: new Date(),
                BankName: "",
                CustomerName: data.customerName,
                BankCode: "",
                PaymentCurrency: "NGN",
                invoice_no: data.AlternateCustReference,
                sources: "OFFLINE"
            }, {transaction: t})


            this.revenue_upload.update({
                payment_status: 2,
                invoice_status: 1,
                invoice: data.invoice,
                amount_paid:  previousAmount + amountPaid,
                payment_date:  new Date(),
            }, {where: {bill_ref_no: data.invoice }}, {transaction: t})

            console.log({amountAfterPayment})

            const taxItems = await this.tax_items.findAll({
                attributes: ['id', 'amount', 'amount_paid', 'invoice_number', 'payment_status', 'discount'],
                where: {
                    invoice_number: data.invoice,
                    payment_status: [0,2]
                },
                raw:true
            });

            // console.log(taxItems)

            let deductAble = amountPaid;
            for (const m of taxItems) {
                const itemOutstanding = parseFloat(m.amount - m.amount_paid);
                let amt = deductAble > itemOutstanding ? deductAble - itemOutstanding :  deductAble;
                // console.log({amt, itemOutstanding})
        
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
                    {new:true}, 
                    {transaction: t}
                );

                // console.log(taxUpdate)
                deductAble = amt;
            }

            return payment;
        }
            
        
    }
    
}

module.exports = Wallet;