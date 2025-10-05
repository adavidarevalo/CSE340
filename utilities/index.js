const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors"></a>'
      grid += '<div class="namePrice">'
      grid += '<hr>'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildVehicleDetail = async function(data){
  let detail = '<div id="detail-display">'
  detail += '<div id="detail-display-image">'
  detail += '<img src="' + data.inv_image + '" alt="' 
  + data.inv_make + ' ' + data.inv_model + '"> '
  detail += '</div>'
  detail += '<div id="detail-display-info">'
  detail += '<h2>' + 'Year: ' + data.inv_year + '</h2>'
  detail += '<hr>'
  detail += '<h2>$' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</h2>'
  detail += '<p>' + data.inv_description + '</p>'
  detail += '<ul>'
  detail += '<li><strong>Mileage:</strong> ' + new Intl.NumberFormat('en-US').format(data.inv_miles) + '</li>'
  detail += '<li><strong>Color:</strong> ' + data.inv_color + '</li>'
  detail += '</ul>'
  detail += '</div>'
  detail += '</div>'
  return detail
}

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware for handling errors
* Wrap other function in this for 
* General Error Handling
**************************************** */
const handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
* **************************************** */
const checkLogin = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          res.clearCookie("accountData")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
* Middleware to check if user is Employee or Admin
* **************************************** */
const checkAdminEmployee = (req, res, next) => {
  if (res.locals.loggedin) {
    const account = res.locals.accountData
    if (account.account_type === "Admin" || account.account_type === "Employee") {
      next()
      return
    }
  }
  req.flash("notice", "Please log in with appropriate credentials.")
  return res.redirect("/account/login")
}

/* ****************************************
* Middleware for handling locals throughout the site
* **************************************** */
const checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          res.clearCookie("jwt")
          res.clearCookie("accountData")
          res.locals.loggedin = 0
          next()
          return
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    res.locals.loggedin = 0
    next()
  }
}

/* **************************************
* Build navigation bar
* ************************************ */
async function getNav() {
  try {
    const pool = require("../database/")
    const data = await pool.query("SELECT * FROM classification ORDER BY classification_name")
    let nav = '<ul class="navigation">';
    // Add Home as the first navigation option
    nav += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach(row => {
      nav += `<li><a href="/inv/type/${row.classification_id}">${row.classification_name}</a></li>`
    })
    nav += '</ul>';
    return nav;
  } catch (error) {
    console.error("getNav error:", error);
    return '<ul class="navigation"><li><a href="/">Home</a></li></ul>';
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
async function buildClassificationGrid(data) {
  let grid = '<ul id="inv-display">'
  
  // Check if data exists and has length
  if (!data || !data.length) {
    grid += '<li>No vehicles available</li>'
    return grid + '</ul>'
  }
  
  // Process each vehicle in the data array
  data.forEach(vehicle => {
    grid += '<li>'
    grid += '<a href="/inv/detail/' + vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' details"><img src="' + vehicle.inv_thumbnail 
      + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model 
      + ' on CSE Motors"></a>'
    grid += '<div class="namePrice">'
    grid += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h2>'
    grid += '<span>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
    grid += '</div>'
    grid += '</li>'
  })
  
  grid += '</ul>'
  return grid
}

module.exports = {
  Util,
  handleErrors,
  checkLogin,
  checkAdminEmployee,
  getNav,
  buildClassificationGrid,
  checkJWTToken,
}