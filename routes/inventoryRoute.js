const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Public routes - accessible to all visitors
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))

// Following routes are protected - only for employees and admins
// Inventory management views
router.get("/", 
  utilities.checkLogin,
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.buildManagementView))

// Add new classification view
router.get("/add-classification", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.buildAddClassification))

// Add new inventory view
router.get("/add-inventory", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.buildAddInventory))

// Process add classification
router.post("/add-classification", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.addClassification))

// Process add inventory
router.post("/add-inventory", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.addInventory))

// Get inventory by classification for management
router.get("/getInventory/:classification_id", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.getInventoryJSON))

// Edit inventory view
router.get("/edit/:inv_id", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.buildEditInventory))

// Process edit inventory form
router.post("/update/", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.updateInventory))

// Delete inventory view
router.get("/delete/:inv_id", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.buildDeleteView))

// Process delete inventory
router.post("/delete/", 
  utilities.checkLogin, 
  utilities.checkAdminEmployee, 
  utilities.handleErrors(invController.deleteInventory))

module.exports = router