
const db = require('../db/connection');
const Revenue_upload = require('../model/Revenue_upload');
const RevenuesInvoices = require('../model/RevenueInvoice');
const Transaction = require('../model/Transaction');
const wallet = require('../model/Wallet');
const WalletTransaction = require('../model/WalletTransaction');

// await tickets
class Wallet {
    constructor() {
        this.walletTransaction = WalletTransaction;
        this.transaction = Transaction;
        this.wallet = wallet
        this.revenuesInvoices = RevenuesInvoices
        this.revenue_upload = Revenue_upload
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
              transactionid: data.bill_ref_no,
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
              transactionId: data.bill_ref_no,
              amount: data.amount,
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

        // console.log(wallet)
        if(wallet) {
            if(parseFloat(wallet.balance) > 0) {
                return {
                    status: true,
                    ...wallet
                }
            } else {
                return {
                    status: false,
                    message: 'You have zero in your wallet'
                }
            }
        } else {
            return { status: false, message: "Wallet not found" }
        }
    }
    // await Revenue_upload
    async makeWalletAssessmentPayment(data) {
        const revInfo = await this.revenue_upload.findOne({
            attributes: ["name_of_business"],
            where: { bill_ref_no: data.bill_ref_no },
            raw: true
        })

        
        const wallet = await this.UserWallet(data.id)

        const walletBalance = parseFloat(wallet.balance) - parseFloat(data.amount);
        await this.walletModel.wallet.update({balance: walletBalance }, {where: {
            walletid: wallet.walletid
        }}, {raw: true})

        const history = await this.walletHistory(data, wallet);
        const transactions = await this.walletTransaction({...data, name: revInfo.name_of_business});

        return {
            ...history, ...transactions
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
        await this.walletModel.wallet.update({balance: walletBalance }, {where: {
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
        console.log({wallet})
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
            const clr = await this.clearTicket({
                number_of_ticket: data.number_of_ticket, 
                batch: data.batch, 
                amount:ticket.amount}, t);
           
            await t.commit()
            // const payLoad = {
            //     InvoiceNumber: ticket.invoice_number,
            //     PaymentRef: ticket.batch,
            //     PaymentDate:  new Date().toISOString().slice(0, 10)+" 00:00:00", //"30/03/2018 17:45:04"
            //     BankCode: "00000",
            //     BankName: "Wallet",
            //     BankBranch: ticket.location,
            //     AmountPaid: parseFloat(ticket.amount) * parseFloat(data.number_of_ticket) ,
            //     TransactionDate: new Date().toISOString().slice(0, 10)+" 00:00:00" ,
            //     Channel: 3,
            //     PaymentMethod: 1, //"Inter-transfer"
            // }
            // await new Email(payLoad, process.env.PAYMENTNOTIFIEMAIL)
            // .sendEmail('payment_notification', "Payment Notification", "message")
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
        const result = await this.wallet.findOne({
            where: {
                userId: userId
            },
            raw: true
        })

        // console.log(result)
        if(result) {
            return {
                status: true,
                balance: parseFloat(result.balance).toFixed(2),
                walletId: result.idwallent,
            }
        } else {
            return {
                status: false,
                message: "No wallet found, contact the system admin for help"
            }
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
    
}

module.exports = Wallet;