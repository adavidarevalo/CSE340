const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

reviewCont.buildAddReview = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const vehicle = await invModel.getVehicleDetails(inv_id)
  
  if (!vehicle) {
    req.flash("notice", "Vehicle not found.")
    return res.redirect("/inv/")
  }

  const hasReview = await reviewModel.checkExistingReview(inv_id, res.locals.accountData.account_id)
  if (hasReview) {
    req.flash("notice", "You have already reviewed this vehicle.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  let nav = await utilities.getNav()
  res.render("./reviews/add-review", {
    title: `Review ${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicle,
    errors: null,
  })
}

reviewCont.addReview = async function (req, res, next) {
  const { inv_id, review_rating, review_title, review_text } = req.body
  const account_id = res.locals.accountData.account_id

  const hasReview = await reviewModel.checkExistingReview(inv_id, account_id)
  if (hasReview) {
    req.flash("notice", "You have already reviewed this vehicle.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  const result = await reviewModel.addReview(inv_id, account_id, review_rating, review_title, review_text)
  
  if (result && typeof result !== 'string') {
    req.flash("notice", "Review added successfully!")
    res.redirect(`/inv/detail/${inv_id}`)
  } else {
    req.flash("notice", "Sorry, adding the review failed. Please try again.")
    res.redirect(`/reviews/add/${inv_id}`)
  }
}

reviewCont.buildUserReviews = async function (req, res, next) {
  const account_id = res.locals.accountData.account_id
  const reviews = await reviewModel.getReviewsByAccountId(account_id)
  
  let nav = await utilities.getNav()
  res.render("./reviews/user-reviews", {
    title: "My Reviews",
    nav,
    reviews,
    errors: null,
  })
}

reviewCont.buildEditReview = async function (req, res, next) {
  const review_id = req.params.review_id
  const review = await reviewModel.getReviewById(review_id)
  
  if (!review || review.account_id !== res.locals.accountData.account_id) {
    req.flash("notice", "Review not found or access denied.")
    return res.redirect("/reviews/")
  }

  let nav = await utilities.getNav()
  res.render("./reviews/edit-review", {
    title: `Edit Review for ${review.inv_make} ${review.inv_model}`,
    nav,
    review,
    errors: null,
  })
}

reviewCont.updateReview = async function (req, res, next) {
  const { review_id, review_rating, review_title, review_text } = req.body
  const account_id = res.locals.accountData.account_id

  const result = await reviewModel.updateReview(review_id, account_id, review_rating, review_title, review_text)
  
  if (result && typeof result !== 'string') {
    req.flash("notice", "Review updated successfully!")
    res.redirect("/reviews/")
  } else {
    req.flash("notice", "Sorry, updating the review failed. Please try again.")
    res.redirect(`/reviews/edit/${review_id}`)
  }
}

reviewCont.deleteReview = async function (req, res, next) {
  const review_id = req.params.review_id
  const account_id = res.locals.accountData.account_id

  const success = await reviewModel.deleteReview(review_id, account_id)
  
  if (success) {
    req.flash("notice", "Review deleted successfully!")
  } else {
    req.flash("notice", "Sorry, deleting the review failed. Please try again.")
  }
  
  res.redirect("/reviews/")
}

module.exports = reviewCont