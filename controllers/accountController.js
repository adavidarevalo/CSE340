const utilities = require('../utilities/')
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message: null
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
    message: null
  })
}

/* ****************************************
*  Process Login Request
* *************************************** */
async function processLogin(req, res) {
  let nav = await utilities.getNav()
  const { email, password } = req.body
  
  // Check if email exists
  const accountData = await accountModel.getAccountByEmail(email)
  if (!accountData) {
    return res.render("account/login", {
      title: "Login",
      nav,
      message: "Please check your credentials and try again.",
      errors: null,
      email
    })
  }
  
  try {
    // Compare the password
    if (await bcrypt.compare(password, accountData.account_password)) {
      // Password matches - set up session and redirect
      delete accountData.account_password
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: 3600 }
      )
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      res.cookie("accountData", JSON.stringify(accountData), { maxAge: 3600 * 1000 })
      
      return res.redirect("/account/")
    } else {
      // Password doesn't match
      return res.render("account/login", {
        title: "Login",
        nav,
        message: "Please check your credentials and try again.",
        errors: null,
        email
      })
    }
  } catch (error) {
    console.error("Login error:", error)
    return res.render("account/login", {
      title: "Login",
      nav,
      message: "An error occurred during login.",
      errors: null,
      email
    })
  }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function processRegistration(req, res) {
  let { first_name, last_name, email, password } = req.body;
  let nav = await utilities.getNav()
  
  // Email validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      message: "Please enter a valid email address",
      first_name,
      last_name,
      email: ""
    });
  }
  
  // Password validation
  const passwordRegex = {
    minLength: password.length >= 12,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  // Check if password meets all requirements
  if (!(passwordRegex.minLength && 
        passwordRegex.hasUpperCase && 
        passwordRegex.hasNumber && 
        passwordRegex.hasSpecialChar)) {
    
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      message: "Password does not meet the requirements",
      first_name,
      last_name,
      email
    });
  }
  
  // Check if email exists in database
  const emailExists = await accountModel.checkExistingEmail(email)
  if (emailExists) {
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      message: "Email already exists. Please log in or use a different email",
      first_name,
      last_name,
      email
    });
  }
  
  // Hash the password before storing
  try {
    // Regular password and cost (salt is generated automatically)
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Store the user in the database
    const regResult = await accountModel.registerAccount(
      first_name,
      last_name,
      email,
      hashedPassword
    )
    
    if (regResult) {
      return res.render("account/login", {
        title: "Login",
        nav,
        message: `Registration successful. Please log in.`,
        errors: null
      })
    } else {
      return res.render("account/register", {
        title: "Register",
        nav,
        message: "Registration failed",
        errors: null,
        first_name,
        last_name,
        email
      })
    }
  } catch (error) {
    console.error("Registration error:", error)
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      message: "Registration failed",
      first_name,
      last_name,
      email
    });
  }
}

/* ****************************************
*  Deliver account home view
* *************************************** */
async function buildAccountHome(req, res, next) {
  let nav = await utilities.getNav()
  
  res.render("account/account", {
    title: "Account Management",
    nav,
    errors: null,
  })
}

module.exports = {
  buildLogin,
  buildRegister,
  processLogin,
  processRegistration,
  buildAccountHome
}
