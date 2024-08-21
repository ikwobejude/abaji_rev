const xml2js = require('xml2js');
const InterSwitch = require('../classes/Interswitch.service');

const interSwitch = new InterSwitch();

module.exports = {
    interSwitchControllers:  function(req, res) {
        // console.log(req.rawBody, req.params.services_id);
        // return
        try {

            interSwitch.initInterSwitch(req.rawBody, req.params.service_id);

            // listening to customer validation event emit
            interSwitch.once("customer-validation", (detail) => {
                console.log({detail})
                const builder = new xml2js.Builder()
                let xml = builder.buildObject(detail);
                res.header('Content-Type', 'text/xml')
                res.send(xml) 
                res.end();
            })

            // Listening to payment notification emit
            interSwitch.once("payment-notification", (payment) => {
                console.log({payment})
                const builder = new xml2js.Builder()
                let xml = builder.buildObject(payment);
                res.header('Content-Type', 'text/xml')
                res.send(xml) 
                res.end();
            })

            interSwitch.on("custom-error", detail => {
                console.log({custom_error: detail})
                const builder = new xml2js.Builder()
                let xml = builder.buildObject(detail);
                res.header('Content-Type', 'text/xml')
                res.send(xml) 
                res.end();
            })

            interSwitch.on("error", (error) => {
                console.log({error})
                // const builder = new xml2js.Builder()
                // let xml = builder.buildObject(detail);
                // res.header('Content-Type', 'text/xml')
                // res.send(xml) 
                // res.end();
            })
        } catch (error) {
            console.log(error)
        }
        
    }
} 