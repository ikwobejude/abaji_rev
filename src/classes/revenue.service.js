const { Worker } = require("worker_threads")
const path = require("path")
const fs = require("fs")
const Revenue_upload = require("../model/Revenue_upload")
const Sequelize  = require("sequelize")

class Revenue {
    constructor(){
        this.revenueUpload = Revenue_upload
    }


    async revenueByYear(data) {
        const revenue = await this.revenueUpload.findAll({
            attributes: [
                ['rate_year', 'year'],
                [ Sequelize.fn('COUNT', Sequelize.col('*')),"total"]
            ],
            group: ['rate_year']
        })
        console.log(revenue)
        return {
            revenue  
        }
    }


    async base64ToExcel(string) {
        // console.log({string})
        try {
            let base64Data = string.split(",")[1];
            // let hol =  data.split(',')[0];
            let ext = string.split(",")[0].split("/")[1].split(";")[0];
            let fileName = `${Date.now()}.xlsx`;
            const binaryData = Buffer.from(base64Data, "base64").toString("binary");
            // console.log(binaryData)
            fs.writeFileSync(`uploads/${fileName}`, binaryData, "binary");
            // return `${fileName}`;
            console.log(fileName)
            return {
                status: true,
                fileName
            }
        } catch (e) {
            console.log(e)
            throw Error(e.message)
        }
    }

    async uploadCooperateBusinessData(data) {
     
        const res = await this.base64ToExcel(data.base64url)
        // console.log(res)
        // return
        if(res.status == true) {
            const res1 = new Promise((resolve, reject) => {
            const file =  res.fileName;
            console.log(file)
            const worker = new Worker(path.join(__dirname,`../worker/revenue_upload.js`), {
                workerData: {
                file
                },
            });
        
            worker.on("message", (data) => {
                // console.log(data)
                resolve(data);
        
                let deleteFile = path.join(__dirname,`../../uploads/${file}`)
        
                if (fs.existsSync(deleteFile)) {
                    fs.unlink(deleteFile, (err) => {
                        if (err) {
                            console.log(err);
                        }
                        console.log('deleted');
                    })
                }
                return data;
            });
        
            worker.on("error", (error) => {
                console.log({error});
                reject(error);
                throw Error( error.message)
            });
        
            worker.on("exit", (code) => {
                if (code !== 0)
                throw Error(`Worker has stopped working with exit code ${code}`)
            });
            });

            return res1;

        } else {
            // return res
            throw Error(res.message)
        }
    }
}

module.exports = Revenue