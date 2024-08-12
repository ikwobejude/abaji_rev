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
// client
//   .send({
//     category: "test",
//     custom_variables: {
//       hello: "world",
//       year: 2022,
//       anticipated: true,
//     },
//     from: { name: "Mailtrap Test", email: SENDER_EMAIL },
//     to: [{ email: RECIPIENT_EMAIL }],
//     subject: "Hello from Mailtrap!",
//     html: `
//     <!doctype html>
//     <html>
//       <head>
//         <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
//       </head>
//       <body style="font-family: sans-serif;">
//         <div style="display: block; margin: auto; max-width: 600px;" class="main">
//           <h1 style="font-size: 18px; font-weight: bold; margin-top: 20px">Congrats for sending test email with Mailtrap!</h1>
//           <p>Inspect it using the tabs you see above and learn how this email can be improved.</p>
//           <img alt="Inspect with Tabs" src="cid:welcome.png" style="width: 100%;">
//           <p>Now send your email using our fake SMTP server and integration of your choice!</p>
//           <p>Good luck! Hope it works.</p>
//         </div>
//         <!-- Example of invalid for email html/css, will be detected by Mailtrap: -->
//         <style>
//           .main { background-color: white; }
//           a:hover { border-left-width: 1em; min-height: 2em; }
//         </style>
//       </body>
//     </html>
//   `,
//     attachments: [
//       {
//         filename: "welcome.png",
//         content_id: "welcome.png",
//         disposition: "inline",
//         content: welcomeImage,
//       },
//     ],
//   })
//   .then(console.log)
//   .catch(console.error);