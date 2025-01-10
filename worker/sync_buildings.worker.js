const path = require("path");
const { workerData, parentPort } = require("worker_threads");
const { v4: uuidv4 } = require("uuid");
const Sequelize = require("sequelize");
const googleDrive = require("../src/lib/googleDrive.util");
const { building } = require("../src/model/Buildings");

const Op = Sequelize.Op;
const data = workerData.data;

const arrOfBuildings = data.data ? data.data : [data];
const user = workerData.user;
// console.log(user);
// return;
const run = async () => {
  const date = new Date();
  let arr = [];
  let bulk1 = [];
  let syncs = [];
  // cloudinaryMediaUpload

  try {
    // console.log(arrOfBuildings)
    for (const buildingData of arrOfBuildings) {
      // return

      const url = await googleDrive.uploadBase64Image(
        buildingData.building_image
      );
      // console.log({url})
      // return
      let build = {
        building_number: buildingData.building_number || date.getTime(),
        tin: buildingData.tin == "Not set" ? "" : buildingData.tin,
        approval_code: buildingData.approval_code,
        building_name: buildingData.building_name,
        building_image: url.webContentLink,
        image_id:url.id,
        building_category_id: buildingData.building_category_id || null,
        state_id: 32,
        lga: buildingData.lga,
        ward: buildingData.ward,
        street_id: buildingData.street_idm ? buildingData.street_id : buildingData.street,
        latitude: buildingData.latitude,
        longitude: buildingData.longitude,
        owner_name: buildingData.owner_name == "Not set" ? null : buildingData.owner_name,
        owner_email: buildingData.owner_email == "Not set" ? null : buildingData.owner_email,
        owner_mobile_no: buildingData.owner_mobile_no == "Not set" ? null : buildingData.owner_mobile_no,
        apartment_type: buildingData.apartment_type ? buildingData.apartment_type : buildingData.building_type,
        no_of_apartments: buildingData.no_of_apartments == "Not set" ? null : buildingData.no_of_apartments,
        building_id: buildingData.building_id,
        service_id: user.service_id || 2147483647,
        property_id: new Date().getTime().toString(36) + "_" + (Date.now() + Math.random().toString()).split(".").join("_"),
        sync: 1,
        registered_by: user.username,
        building_tag: buildingData?.building_tag,
        item_codes: buildingData?.taxitem.toString(),
      };

      // console.log(build);
      arr.push(build);

      // push all the buinding to array
      try {
        const existingBuilding = await building.findOne({
          where: {
            building_id: buildingData.building_id,
            service_id: user.service_id,
          },
        });
        if (existingBuilding) {
          existingBuilding.update(build);
          syncs.push(build.building_number);
        } else {
          await building.create(build);
          syncs.push(build.building_number);
        }
      } catch (error) {
        await googleDrive.deleteFromGoogleDrive(url.id);
        parentPort.postMessage({
          status: false,
          message: error.message,
        });
      }
    }

    //     // console.log({arr, bulk1})

    parentPort.postMessage({
      status: true,
      message: "Created Successfully",
      nextpage: parseInt(data.page) + 1,
      isEnd: syncs.length > 0 ? 1 : 0,
      syncIds: syncs,
    });
  } catch (error) {
    parentPort.postMessage({
      status: false,
      message: error.message,
    });
  }
};

run();
