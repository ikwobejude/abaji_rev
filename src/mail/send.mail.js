const fs = require("node:fs")
const path = require("node:path")

const { MailtrapClient } = require("mailtrap")

/**
 * For this example, you need to have ready-to-use sending domain or,
 * a Demo domain that allows sending emails to your own account email.
 * @see https://help.mailtrap.io/article/69-sending-domain-setup
 */

const TOKEN = process.env.MAILTRAP_TOKEN;
const SENDER_EMAIL = process.env.MAIL_FROM_ADDRESS;
// const RECIPIENT_EMAIL = "<RECIPIENT@EMAIL.COM>";

const client = new MailtrapClient({ token: TOKEN });

// const welcomeImage = fs.readFileSync(path.join(__dirname, "logo.png"));

class SendEmail {
    constructor() {
        this.client =  client
    }

    static async sendEmail(recipient_email,subject,template,message,attachments = [],data = {}){

        const templatePath = path.resolve(__dirname,"../../views/mail/",template + ".ejs");

        const html = await ejs.renderFile(templatePath,{ data },{ async: true });
        const msg = {
            from: { name: "ABAJI LGA REVENUE", email: SENDER_EMAIL },
            to: recipient_email,
            subject: subject,
            html: html,
            attachments: attachments
        }

        await this.client.send(msg)
    }
}

module.exports = SendEmail
