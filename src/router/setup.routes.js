const express = require("express");
const setup = require("../controller/setup.controller");

const Router = express.Router();

Router.route("/ticket_item")
  .get(setup.getTicketItem)
  .post(setup.postTicketItem);

Router.route("/ticket_item/:id")
  .put(setup.editTicketItem)
  .delete(setup.deleteTicketItem);

Router.get("/state", setup.getState);
Router.get("/lga", setup.getLgaWithOutRender);
Router.route("/ward").get(setup.getWard).post(setup.postWard);
Router.route("/lgas").get(setup.getLga);
Router.route("/ward/:id").put(setup.editWard).delete(setup.deleteWard);

Router.route("/street").get(setup.getStreets).post(setup.postStreet);
Router.get("/street/:ward_id", setup.getStreet);

Router.route("/inter_switch")
  .post(setup.postInterSwitch)
  .get(setup.fetchInterSwitch);
Router.route("/account").post(setup.createAccount).get(setup.fetchAcct);
Router.route('/approval_type').post(setup.createApproval_types).get(setup.fetch_approval_types)
Router.get("/building_categories", setup.building_categories);
Router.post("/building_categories", setup.create_building_category);
Router.get("/building_types", setup.building_types);
Router.post("/building_types", setup.createBuildingType);
// Router.get("/business_types", setup.)
Router.route("/business_types")
  .get(setup.getBusinessTypes)
  .post(setup.addBusinessTypes);
Router.route("/business_categories")
  .get(setup.getBusinessCategory)
  .post(setup.addBusinessCategory);

Router.route("/business_sizes")
  .get(setup.getBusinessSizes)
  .post(setup.addBusinessSizes);
Router.route("/business_sector")
  .get(setup.getBusinessSector)
  .post(setup.addBusinessSector);
Router.route("/business_operations")
  .get(setup.getBusinessOperations)
  .post(setup.addBusinessOperations);

Router.route('/office')
   .get(setup.office)
   .post(setup.createOffices)

module.exports = Router;
