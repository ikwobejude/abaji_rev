const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { MailtrapTransport }  = require('mailtrap')
// require('')
const ejs = require('ejs');
const { convert } = require('html-to-text')

const TOKEN = process.env.MAILTRAP_TOKEN;
const SENDER_EMAIL = process.env.MAIL_FROM_ADDRESS;


// const logoPath = path.join(__dirname, '../../public/1.png');
// const base64Image = fs.readFileSync(logoPath, 'base64');
// const logoSrc = `data:image/png;base64,${base64Image}`;

class Email {
    constructor(detail){
        this.details = detail;
        this.from = SENDER_EMAIL;
    }

    newTransport(){
       return nodemailer.createTransport(MailtrapTransport({
            token: TOKEN
        }));
    }

    // send the actual email
    async send(){
        // `./../views/email/${template}.ejs
            const html = await ejs.renderFile(`${__dirname}/../../views/email/${this.details.template}.ejs`, {
                url: this.details.url,
                detail: this.details,
                subject: this.details.subject,
                // logoSrc: 
            })

            // console.log(this.details)
            const options = {
                wordwrap: 130,
                // ...
              };
            //2 define the email option
            const mailOptions = {
                from: {
                    address: this.from,
                    name: "SEAMLEX"
                },
                to: {
                    address: this.details.email,
                    name: this.details.name
                },
                subject: this.details.subject,
                html,
                text: convert(html, options)
            }

            // console.log(mailOptions)

            await this.newTransport().sendMail(mailOptions);
    }

    async sendEmail(){
        await this.send()
    }
}


module.exports = Email;