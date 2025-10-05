const express = require('express')
const router = new express.Router()
const accountController = require('../controllers/accountController')

// Route to deliver login view
router.get('/login', accountController.buildLogin)

// Route to deliver registration view
router.get('/register', accountController.buildRegister)

// Process the login attempt
router.post('/login', accountController.processLogin)

// Process the registration form
router.post('/register', accountController.processRegistration)

module.exports = router
