const xml2js = require('xml2js');
const InterSwitch = require('../classes/Interswitch.service');

const interSwitch = new InterSwitch();

module.exports = {
    interSwitchControllers:  function(req, res) {
        try {

            interSwitch.initInterSwitch(req.rawBody, req.params.services_id);

            // listening to customer validation event emit
            interSwitch.on("customer-validation", detail => {
                console.log({detail})
                const builder = new xml2js.Builder()
                let xml = builder.buildObject(detail);
                res.header('Content-Type', 'text/xml')
                res.send(xml) 
            })

            // Listening to payment notification emit
            interSwitch.on("payment-notification", detail => {
                console.log({detail})
                const builder = new xml2js.Builder()
                let xml = builder.buildObject(detail);
                res.header('Content-Type', 'text/xml')
                res.send(xml) 
            })

            interSwitch.on("custom-error", detail => {
                console.log({error: detail})
                const builder = new xml2js.Builder()
                let xml = builder.buildObject(detail);
                res.header('Content-Type', 'text/xml')
                res.send(xml) 
            })
        } catch (error) {
            console.log(error)
        }
        
    }
} 