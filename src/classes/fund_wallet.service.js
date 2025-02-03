
const Sequelize = require('sequelize')
const { v4: uuidv4 } = require('uuid');
const db = require('../db/connection');
const Revenue_upload = require('../model/Revenue_upload');
const RevenuesInvoices = require('../model/RevenueInvoice');
const Transaction = require('../model/Transaction');
const Users = require('../model/Users');
const wallet = require('../model/Wallet');
const WalletTransaction = require('../model/WalletTransaction');

class FundWallet {
    constructor(){
        this.wallet_transaction = WalletTransaction;
        this.transaction = Transaction;
        this.wallet = wallet
        this.revenuesInvoices = RevenuesInvoices
        this.revenue_upload = Revenue_upload
        this.users = Users
        this.db = db
        this.Op = Sequelize.Op
    }

    async creditWallet(value, user) {
        // console.log(value)
        const transactionExist = await this.transaction.findOne({
          where: { transactionId: value.transactionId },
        });
    
        // Check is transaction has been initiated before
        if (transactionExist) {
          throw Error("Transaction Already Exist");
        }
    
        const walletUser = await this.users.findOne({
          attributes: ["id", "service_id"],
          where: {
            [this.Op.or]: [
              { username: value.email },
              { email: value.email },
            ],
          },
          raw: true,
        });
    
        // check if user have a wallet, else create wallet
        const wallet = await this.validateUserWallet(walletUser.id, walletUser.service_id);
    
        // console.log(wallet)
    
        const t = await this.db.transaction();
        try {
          await this.createWalletTransaction(walletUser.id,"successful","NGN",value.amount, "TOPIT", wallet.idwallent, value.transactionid, t);
          // create transaction
          let customer = {
            name: value.owner_name,
            email: value.email,
            phone_number: value.agant_phone_number,
            topitby: user.id,
          };
    
          await this.createTransaction(walletUser.id, value.transactionId, "successful", "transaction", value.amount, customer, "TOPIT", "successful", t);
    
          await this.updateWallet(walletUser.id, value.amount, user.service_id, t);
          await t.commit();
    
          return {
            status: true,
            message: "Wallet funded successfully",
          };
        } catch (error) {
          console.log(error);
          await t.rollback();
          throw Error(error.message);
        }
      }
    
      async validateUserWallet(id) {
        const walletUser = await this.wallet.findOne({
          where: { userId: id },
          raw: true,
        });
        if (walletUser) {
          return walletUser;
        } else {
          const nUser = {
            userId: id,
            service_id,
            idwallent: uuidv4(),
          };
          const newWallet = await this.wallet.create(nUser);
          return newWallet;
        }
      }
    
      async createWalletTransaction(userId, status, currency, amount, method, walletid, transactionid, t) {
        // create wallet transaction
        const walletTransaction = await this.wallet_transaction.create(
          {
            userId: userId,
            isInflow: 1,
            currency: currency,
            amount: amount,
            status: status,
            paymentMethod: method,
            walletid: walletid,
            transactionid: transactionid
          },
          { transaction: t }
        );
    
        return walletTransaction;
      }
    
      // Create Transaction
      async createTransaction(userId, id, status, currency, amount, customer, gatway, statuss, t) {
        // create transaction
        console.log(customer)
        const transaction = await this.transaction.create(
          {
            userId: userId,
            transactionId: id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone_number,
            amount: amount,
            currency: currency,
            paymentStatus: statuss,
            paymentGateway: gatway ? gatway : "Monnify",
            isInflow: 1,
            topitby: customer.topitby,
            description: "Topup",
          },
          { transaction: t }
        );
        return transaction;
      }
    
      // Update wallet
      async updateWallet(userId, amount, service_id, t) {
        let wallet = await this.wallet.findOne({
          where: { userId: userId },
        });
        // return wallet
        const prevAmount = parseFloat(wallet.balance);
        const topUpAmount = parseFloat(amount);
    
        const newAmount = prevAmount + topUpAmount;
        // console.log(newAmount)
        wallet.update({ balance: newAmount, service_id }, { new: true }, { transaction: t });
        return;
      }
    
    
      async walletRecords(query, user) {
          // console
          const perPage = 20; // number of records per page
          const page = query.page || 1;
          let offset = perPage * page - perPage;
        
          if (user.group_id == 111111 || user.group_id == 222222) {
            let sql = `
            SELECT 
            transaction.*, 
            topit.name as tname, 
            U.name AS uname 
             FROM transaction 
             LEFT JOIN users AS topit ON transaction.topitby =  topit.id
             INNER JOIN users AS U  ON transaction.userid =  U.id
             WHERE isInflow IS NOT NULL
             `;
        
            if (query.type) {
              sql += ` AND transaction.isInflow = '${query.type}'`;
            }
        
            if (query.customerId) {
              sql += ` AND transaction.transactionId = '${query.customerId}'`;
            }
        
            if (query.gateway) {
              sql += ` AND transaction.paymentGateway = '${query.gateway}'`;
            }
            
        
            if (query.from && query.to) {
              sql += ` AND Date(transaction.created_on) >= '${query.from}'`;
              sql += ` AND Date(transaction.created_on) <= '${query.to}'`;
            } 
            if(query.from && !query.to ){
              sql += ` AND Date(transaction.created_on) = '${query.from}'`;
            }
        
            const cnt = await this.db.query(sql, {type: Sequelize.QueryTypes.SELECT});
            sql += ` ORDER BY transaction.id DESC LIMIT ${perPage} OFFSET ${offset}`;
            const transaction = await this.db.query(sql, {type: Sequelize.QueryTypes.SELECT});
            const count = cnt.length;
            return {
              current: page,
              pages: Math.ceil(count / perPage),
              page_title: "Wallet",
              transaction: transaction,
              type: query.type,
              customerId: query.customerId,
              gateway: query.gateway,
              from: query.from,
              to: query.to,
            }
            
          } else {
        
            let sql = `
            SELECT 
            transaction.*, 
            topit.name as tname, 
            U.name AS uname 
             FROM transaction 
             LEFT JOIN users AS topit ON transaction.topitby =  topit.id
             INNER JOIN users AS U  ON transaction.userid =  U.id 
            where transaction.userId=${user.id} 
            `;
            if (query.type) {
              sql += ` AND transaction.isInflow = '${query.type}'`;
            }
        
            if (query.customerId) {
              sql += ` AND transaction.transactionId = '${query.customerId}'`;
            }
        
            if (query.gateway) {
              sql += ` AND transaction.paymentGateway = '${query.gateway}'`;
            }
        
            if (query.from && query.to) {
              sql += ` AND Date(transaction.created_on) >= '${query.from}'`;
              sql += ` AND Date(transaction.created_on) <= '${query.to}'`;
            } 
            if(query.from && !query.to ){
              sql += ` AND Date(transaction.created_on) = '${query.from}'`;
            }
        
            const cnt = await this.db.query(sql, {type: Sequelize.QueryTypes.SELECT});
            sql += ` ORDER BY transaction.id DESC LIMIT ${perPage} OFFSET ${offset}`;
            const transaction = await this.db.query(sql, {type: Sequelize.QueryTypes.SELECT});
            const count = cnt.length;
        
            return {
              page_title: "Wallet",
              transaction,
              current: page,
              type: query.type,
              customerId: query.customerId,
              gateway: query.gateway,
              pages: Math.ceil(count / perPage),
              from: query.from,
              to: query.to,
            }
           
          }
      }
    
      async makePayment(data, wallet, user) {
        // console.log({data, wallet, user})
        if(parseFloat(data.amount) <= parseFloat(wallet)) {
         const t = await this.db.transaction();
         try {
          if(data.assessment_type == "Building Renewal" || data.assessment_type == "Building Enumeration") {
            // console.log(data.assessment_type)
            await this.clearAssessmentPayment(data, user, t)
            await this.walletPaymentTransaction(data, user, t)
    
          };
          if(data.assessment_type == "New registration") {
            const ast = await this.clearAssessmentPayment(data, user, t)
            await this.walletPaymentTransaction(data, user, t)
            await this.clearNewRegistrationPayment(ast.assessment_ref, t)
          }
          if(data.assessment_type == "Other revenue") {
            await this.clearAssessmentPayment(data, user, t)
            await this.walletPaymentTransaction(data, user, t)
          }
    
          console.log(t)
          await t.commit();
          return {
            status: true,
            message: "Payment success",
          }
         } catch (error) {
          await t.rollback();
          throw Error(error.message)
         }
          
    
    
        } else {
          throw Error('Insufficient fund!')
        }
      }
    
      async clearAssessmentPayment(data, user, t) {
        const assessment = await this.assessments.findOne({ where: {invoice_number: data.invoice_number}, raw: true});
        const outstanding = parseFloat(assessment.assessment_amount - assessment.assessment_amount_paid);
        const previousAmountPaid = parseFloat(assessment.assessment_amount_paid);
        const amountPaid = parseFloat(data.amount);
    
        console.log(assessment)
    
        // return
    
        if(amountPaid >= outstanding) {
          const totalPaid = previousAmountPaid + parseFloat(data.amount);
          await this.assessments.update({
            assessment_amount_remaining: parseFloat(assessment.assessment_amount) - totalPaid,
            assessment_amount_paid:totalPaid,
            settlement_status: 1,
            settlement_date: new Date(),
            settlement_method: "WALLET"
          }, { where: {invoice_number: data.invoice_number}}, {new: true}, {transaction: t})
    
          await this.assessmentItemInvoice.update({
            locked: 1,
            paid: 1,
          }, { where: {invoice_number: data.invoice_number}}, {new: true}, {transaction: t})
    
          await this.api_payment.create({
              PaymentLogId: helper.random10(20),
              service_id: user.service_id,
              CustReference: data.invoice_number,
              AlternateCustReference:  helper.random10(15),
              Amount:  data.amount,
              PaymentMethod:"WALLET", 
              PaymentReference: helper.random10(20),
              ChannelName: "WALLET",
              PaymentDate: new Date(),
              BankName: "",
              CustomerName: assessment.tax_payer_name,
              BankCode: "",
              PaymentCurrency: "NGN",
              invoice_no: data.AlternateCustReference,
              sources: "OFFLINE",
              taxpayer_rin: assessment.tax_payer_rin
          }, {transaction: t})
        } else {
          const totalPaid = previousAmountPaid + parseFloat(data.amount);
          await this.assessments.update({
            assessment_amount_remaining: parseFloat(assessment.assessment_amount) - totalPaid,
            assessment_amount_paid:totalPaid,
            settlement_status: 2,
            settlement_date: new Date(),
            settlement_method: "WALLET"
          }, { where: {invoice_number: data.invoice_number}}, {new: true})
    
          await this.assessmentItemInvoice.update({
            locked: 1,
            paid: 2,
          }, { where: {invoice_number: data.invoice_number}}, {new: true})
    
          await this.api_payment.create({
              PaymentLogId: helper.random10(20),
              service_id: user.service_id,
              CustReference: data.invoice_number,
              AlternateCustReference:  helper.random10(15),
              Amount:  data.amount,
              PaymentMethod:"WALLET", 
              PaymentReference: helper.random10(20),
              ChannelName: "WALLET",
              PaymentDate: new Date(),
              BankName: "",
              CustomerName: assessment.tax_payer_name,
              BankCode: "",
              PaymentCurrency: "NGN",
              invoice_no: data.AlternateCustReference,
              sources: "OFFLINE",
              taxpayer_rin: assessment.tax_payer_rin
          }, {transaction: t})
        }
    
        return {
          assessment_ref: assessment.assessment_ref
        }
      }
    
    
    
      async walletPaymentTransaction(data, user, t) {
        // console.log(data.id)
        const assessment = await this.assessments.findOne({ where: {invoice_number: data.invoice_number}, raw: true});
    
        const wallet = await this.wallet.findOne({where: {userId: user.id }});
        const bal = parseFloat(wallet.balance) - parseFloat(data.amount);
        //Update wallet new price
        wallet.update({balance: bal}, {new:true} , {transaction: t})
    
        const walletHistroy = await this.wallet_transactions.create({
          userId: user.id,
          isInflow: 2,
          paymentMethod: "Cash",
          currency: "NGN",
          amount: data.amount,
          walletid: wallet.idwallent,
          transactionid: assessment.invoice_number,
          // created_on: , 
          status: "successful"
        }, {transaction: t})
    
        const tran = await this.transactions.create({
          userId: user.id,
          name: assessment.tax_payer_name,
          isInflow: 2,
          transactionId: assessment.invoice_number,
          amount: data.amount,
          currency:  "NGN",
          paymentStatus: "successful",
          paymentGateway: "AGENT",
          description: assessment.assessment_note,
          topitby:  user.id
        }, {transaction: t})
      
        return {...walletHistroy, ...tran};
      }
    
    
      async clearNewRegistrationPayment(trackNumber) {
        return await this.application.update({
          paid: 1
        },{where: {
          application_number: trackNumber,
        }}, {new: true}, {transaction: t})
      }

      async wallets(service_id) {
        return await this.db.query(`
            SELECT 
                w.*,
                u.name
            FROM wallet AS w
            INNER JOIN  users AS u ON u.id = w.userId
            WHERE w.service_id = :service_id
            `, {
              replacements: {
                service_id
              },
              type: Sequelize.QueryTypes.SELECT
            })
      }

      async userWalletTransaction(query) {
        // console
        const perPage = 20; // number of records per page
        const page = query.page || 1;
        let offset = perPage * page - perPage;
      
          let sql = `
          SELECT 
          transaction.*, 
          topit.name as tname, 
          U.name AS uname 
           FROM transaction 
           LEFT JOIN users AS topit ON transaction.topitby =  topit.id
           INNER JOIN users AS U  ON transaction.userid =  U.id
           WHERE isInflow IS NOT NULL
           `;
      
        if (query.id) {
            sql += ` AND transaction.userId = '${query.id}'`;
          }
          if (query.type) {
            sql += ` AND transaction.isInflow = '${query.type}'`;
          }
      
          if (query.customerId) {
            sql += ` AND transaction.transactionId = '${query.customerId}'`;
          }
      
          if (query.gateway) {
            sql += ` AND transaction.paymentGateway = '${query.gateway}'`;
          }
          
      
          if (query.from && query.to) {
            sql += ` AND Date(transaction.created_on) >= '${query.from}'`;
            sql += ` AND Date(transaction.created_on) <= '${query.to}'`;
          } 
          if(query.from && !query.to ){
            sql += ` AND Date(transaction.created_on) = '${query.from}'`;
          }
      
          const cnt = await this.db.query(sql, {type: Sequelize.QueryTypes.SELECT});
          sql += ` ORDER BY transaction.id DESC LIMIT ${perPage} OFFSET ${offset}`;
          const transaction = await this.db.query(sql, {type: Sequelize.QueryTypes.SELECT});
          const count = cnt.length;

          // console.log(transaction)
          return {
            current: page,
            pages: Math.ceil(count / perPage),
            page_title: "Wallet",
            transaction: transaction,
            type: query.type,
            customerId: query.customerId,
            gateway: query.gateway,
            from: query.from,
            to: query.to,
          }
    }
}


module.exports = FundWallet