const axios = require('axios');


class payDemo {
    constructor() {
        this.baseUrl = "https://pay.smartappsdemo.com.ng/";
        this.httpCLient = axios
    }


    async initialize(payload) {

        const response = await this.httpCLient.post(`${this.baseUrl}initialize_payments`, payload, {
            headers: {
                'Authorization': `${process.env.PAY_TOKEN}`,
                'Content-Type': "application/json"
              }
        })

        console.log(response.data)

        return response.data
    }


    async payNotification() {
        
    }
}

module.exports = new payDemo();