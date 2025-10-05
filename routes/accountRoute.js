const express = require('express')
const router = new express.Router()
const accountController = require('../controllers/accountController')
const utilities = require('../utilities/')

// Route to deliver login view
router.get('/login', utilities.handleErrors(accountController.buildLogin))

// Route to deliver registration view
router.get('/register', utilities.handleErrors(accountController.buildRegister))

// Process the login attempt
router.post('/login', utilities.handleErrors(accountController.processLogin))

// Process the registration form
router.post('/register', utilities.handleErrors(accountController.processRegistration))

// Deliver account home view
router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountHome))

// Deliver account update view
router.get('/update/:account_id', utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate))

// Process account update
router.post('/update', utilities.handleErrors(accountController.updateAccount))

// Process password update
router.post('/update-password', utilities.handleErrors(accountController.updatePassword))

// Process logout
router.get('/logout', utilities.handleErrors(accountController.processLogout))

module.exports = router
