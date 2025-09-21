// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const Util = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", Util.handleErrors(invController.buildByClassificationId));

// Route to build a specific vehicle detail view
router.get("/detail/:invId", Util.handleErrors(invController.buildVehicleDetail));


module.exports = router;