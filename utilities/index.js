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

const handleErrors = fn => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next)

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

async function getNav() {
  try {
    const pool = require("../database/")
    const data = await pool.query("SELECT * FROM classification ORDER BY classification_name")
    let nav = '<ul class="navigation">';
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

async function buildClassificationGrid(data) {
  let grid = '<ul id="inv-display">'
  
  if (!data || !data.length) {
    grid += '<li>No vehicles available</li>'
    return grid + '</ul>'
  }
  
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

async function buildReviewsHTML(reviews, averageRating, isLoggedIn, vehicleId, hasUserReview) {
  let html = '<div class="reviews-section">'
  html += '<h3>Customer Reviews</h3>'
  
  if (averageRating && averageRating.review_count > 0) {
    html += '<div class="average-rating">'
    html += '<div class="rating-display">'
    for (let i = 1; i <= 5; i++) {
      html += i <= Math.round(averageRating.avg_rating) ? '<span class="star filled">★</span>' : '<span class="star">★</span>'
    }
    html += '</div>'
    html += `<span class="rating-text">${parseFloat(averageRating.avg_rating).toFixed(1)} out of 5 (${averageRating.review_count} review${averageRating.review_count === 1 ? '' : 's'})</span>`
    html += '</div>'
  }
  
  if (isLoggedIn && !hasUserReview) {
    html += `<div class="add-review-link"><a href="/reviews/add/${vehicleId}" class="btn-review">Write a Review</a></div>`
  }
  
  if (reviews && reviews.length > 0) {
    html += '<div class="reviews-list">'
    reviews.forEach(review => {
      html += '<div class="review-item">'
      html += '<div class="review-header">'
      html += `<strong>${review.account_firstname} ${review.account_lastname.charAt(0)}.</strong>`
      html += '<div class="review-rating">'
      for (let i = 1; i <= 5; i++) {
        html += i <= review.review_rating ? '<span class="star filled">★</span>' : '<span class="star">★</span>'
      }
      html += '</div>'
      html += '</div>'
      html += `<h4>${review.review_title}</h4>`
      html += `<p>${review.review_text}</p>`
      html += `<small>Reviewed on ${new Date(review.review_date).toLocaleDateString()}</small>`
      html += '</div>'
    })
    html += '</div>'
  } else if (!isLoggedIn) {
    html += '<p><a href="/account/login">Login</a> to write a review for this vehicle.</p>'
  } else {
    html += '<p>No reviews yet. Be the first to review this vehicle!</p>'
  }
  
  html += '</div>'
  return html
}

module.exports = {
  Util,
  handleErrors,
  checkLogin,
  checkAdminEmployee,
  getNav,
  buildClassificationGrid,
  buildVehicleDetail: Util.buildVehicleDetail,
  buildClassificationList: Util.buildClassificationList,
  checkJWTToken,
  buildReviewsHTML,
}