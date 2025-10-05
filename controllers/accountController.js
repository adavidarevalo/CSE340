const utilities = require('../utilities/')

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Login Request
* *************************************** */
async function processLogin(req, res) {
  // Placeholder for login processing logic
  res.status(200).send('Login process')
}

/* ****************************************
*  Process Registration
* *************************************** */
async function processRegistration(req, res) {
  // Placeholder for registration processing logic
  res.status(200).send('Registration process')
}

module.exports = {
  buildLogin,
  buildRegister,
  processLogin,
  processRegistration
}
