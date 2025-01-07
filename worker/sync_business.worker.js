const path = require("path");
const { workerData, parentPort } = require("worker_threads");
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const googleDrive = require("../lib/googleDrive.util");

const { businesses } = require("../model/business.model");

const Op = Sequelize.Op;
const data = workerData.data;
const arrOfBusiness = data.data ? data.data : [data];
const user = workerData.user;

const run = async () => {
  try {
    
    let syncs = [];

    for (const businessData of arrOfBusiness) {
      // console.log(businessData);
      // return;
      //  const rin = helper.randomNum(10);
       const url = await googleDrive.uploadBase64Image(businessData.photo_url);
       let business1 = {
             business_type: businessData.business_type,
             business_street: businessData.business_street_id,
             business_name: businessData.business_name,
             business_category: businessData.business_category,
             business_sector: businessData.business_sector,
             business_operation: businessData.business_operation,
             business_size: businessData.business_size,
             business_address: businessData.business_address,
             businessnumber: businessData.businessnumber,
             business_email: businessData.business_email,
             business_ownership: businessData.business_ownership,
             Profile_ref: url.id,
             business_tag: businessData.business_tag,
             service_id: user.service_id,
             created_by: user.username,
             building_id: businessData.building_id,
             photo_url: url.webContentLink,
             taxpayer_rin: businessData.tin,
             Status: "ACTIVE",
             asset_type: "Business",
             business_structure: "Business",
             sync:1,
             tax_item_codes: businessData?.taxitem.toString(),
         }
      try {
          const business = await businesses.findOne({
            where: {
              building_id: businessData.building_id,
              business_tag: businessData.business_tag,
            }
          });
  
          if(business){
            business.update(business1, {new:true})
            syncs.push(businessData.business_tag)
          } else {
            await businesses.create(business1)
            syncs.push(businessData.business_tag)
          }
      } catch (error) {
        await googleDrive.deleteFromGoogleDrive(url.id);
        parentPort.postMessage({
          status: false,
          message: error.message,
        });
      }  
    }

    parentPort.postMessage({
        status: "success",
        message: "Created Successfully",
        page: parseInt(data.page) + 1,
        isEnd: syncs.length > 0 ? 1 : 0,
        syncIds: syncs
    })
      
     
  } catch (error) {
    parentPort.postMessage({
      status: false,
      message: error.message,
    });
  }
};

run();
