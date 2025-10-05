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
  let message = null
  
  if (req.query.notice) {
    message = req.query.notice
  }
  
  if (req.flash) {
    message = req.flash("notice")
  }
  
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    message
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
  try {
    let nav = await utilities.getNav()
    const welcomeMessage = "You're logged in."
    
    res.render("account/account", {
      title: "Account Management",
      nav,
      errors: null,
      welcomeMessage,
      message: null
    })
  } catch (error) {
    console.error("Error in buildAccountHome:", error)
    req.flash("error", "An error occurred loading the account page")
    res.status(500).render("errors/error", {
      title: "Server Error",
      nav: await utilities.getNav(),
      message: "An error occurred loading the account page"
    })
  }
}

/* ****************************************
*  Process Logout
* *************************************** */
async function processLogout(req, res) {
  res.clearCookie("jwt")
  res.clearCookie("accountData")
  return res.redirect("/")
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  
  // Make sure the logged in user can only update their own account
  if (account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "You can only update your own account information.")
    return res.redirect("/account/")
  }
  
  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
  })
}

/* ****************************************
*  Process Account Update
* *************************************** */
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  
  // Server-side validation
  let errors = []
  if (!account_firstname) errors.push({ msg: "First name is required" })
  if (!account_lastname) errors.push({ msg: "Last name is required" })
  
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailPattern.test(account_email)) errors.push({ msg: "Valid email is required" })
  
  if (errors.length > 0) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: { array: () => errors },
      message: null,
      account_firstname,
      account_lastname,
      account_email,
      accountData: res.locals.accountData
    })
  }
  
  // Check if email exists and belongs to someone else
  const emailExists = await accountModel.checkExistingEmail(account_email)
  const currentAccount = await accountModel.getAccountById(account_id)
  
  if (emailExists && currentAccount.account_email !== account_email) {
    errors.push({ msg: "Email already exists. Please use a different email" })
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: { array: () => errors },
      message: null,
      account_firstname,
      account_lastname,
      account_email,
      accountData: res.locals.accountData
    })
  }
  
  // Update account
  const updateResult = await accountModel.updateAccount(
    account_id,
    account_firstname,
    account_lastname,
    account_email
  )
  
  if (updateResult) {
    // Update the JWT and cookie with new information
    const updatedAccount = await accountModel.getAccountById(account_id)
    delete updatedAccount.account_password
    
    const accessToken = jwt.sign(
      updatedAccount, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: 3600 }
    )
    
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    res.cookie("accountData", JSON.stringify(updatedAccount), { maxAge: 3600 * 1000 })
    
    req.flash("notice", "Account updated successfully")
    return res.redirect("/account/")
  } else {
    errors.push({ msg: "Update failed. Please try again." })
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: { array: () => errors },
      message: null,
      account_firstname,
      account_lastname,
      account_email,
      accountData: res.locals.accountData
    })
  }
}

/* ****************************************
*  Process Password Update
* *************************************** */
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  
  // Server-side password validation
  let errors = []
  const passwordRegex = {
    minLength: account_password.length >= 12,
    hasUpperCase: /[A-Z]/.test(account_password),
    hasNumber: /[0-9]/.test(account_password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(account_password)
  }
  
  if (!(passwordRegex.minLength && passwordRegex.hasUpperCase && 
        passwordRegex.hasNumber && passwordRegex.hasSpecialChar)) {
    errors.push({ msg: "Password does not meet requirements" })
  }
  
  if (errors.length > 0) {
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: { array: () => errors },
      message: null,
      accountData: res.locals.accountData
    })
  }
  
  // Hash the password
  const hashedPassword = await bcrypt.hash(account_password, 10)
  
  // Update password in the database
  const passwordChangeResult = await accountModel.updatePassword(account_id, hashedPassword)
  
  if (passwordChangeResult) {
    req.flash("notice", "Password updated successfully")
    return res.redirect("/account/")
  } else {
    errors.push({ msg: "Password update failed. Please try again." })
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: { array: () => errors },
      message: null,
      accountData: res.locals.accountData
    })
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  processLogin,
  processRegistration,
  buildAccountHome,
  processLogout,
  buildAccountUpdate,
  updateAccount,
  updatePassword
}
