const path = require("path");
const { workerData, parentPort } = require("worker_threads");
const Sequelize = require("sequelize");
const readXlsxFile = require("read-excel-file/node");
const db = require("../db/connection");
const Lgas = require("../model/LGA");

const uploadLgaDataFromExcel = async () => {
  const t = await db.transaction();
  try {
    const rows = await readXlsxFile(
      path.join(__dirname, "../../uploads/" + workerData.file)
    );
    rows.shift(); // Remove headers

    const lgaUploads = [];

    for (const row of rows) {
      const [stateName, lgaName] = row;

      // Fetch state_id
      const state = await db.query(
        "SELECT state_id FROM states WHERE state_name = :stateName",
        {
          replacements: { stateName },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (!state || state.length === 0) {
        console.log(`State not found: ${stateName}`);
        continue;
      }

      const stateId = state[0].state_id;

      // Check if LGA already exists
      const existingLga = await Lgas.findOne({
        where: { lga: lgaName, state_id: stateId },
      });

      if (existingLga) {
        console.log(`LGA already exists: ${lgaName} in ${stateName}`);
        continue;
      }

      // Prepare LGA upload data
      lgaUploads.push({
        lga: lgaName,
        lga_code: `${stateId}-${lgaName.substring(0, 3).toUpperCase()}`,
        state_id: stateId,
      });
    }

    // Bulk create or update LGAs
    if (lgaUploads.length > 0) {
      await Lgas.bulkCreate(lgaUploads, {
        updateOnDuplicate: ["lga_code", "state_id"],
        transaction: t,
      });
      console.log(`${lgaUploads.length} LGAs uploaded successfully.`);
    } else {
        
      console.log("No new LGAs to upload.");
    }

    await t.commit();
    parentPort.postMessage({
      status: true,
      message: "upload process completed!!!",
    });
  } catch (error) {
    await t.rollback();
    console.error("Error uploading LGAs:", error.message);
    parentPort.postMessage({
      status: false,
      message: `Error uploading LGAs: ${error.message}`,
    });
  }
};

uploadLgaDataFromExcel();
