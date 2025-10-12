const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidation = require("../utilities/review-validation")

// Get user's reviews
router.get("/", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildUserReviews))

// Add review view
router.get("/add/:inv_id", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildAddReview))

// Process add review
router.post("/add", 
  utilities.checkLogin,
  reviewValidation.reviewValidationRules(),
  reviewValidation.checkReviewData,
  utilities.handleErrors(reviewController.addReview))

// Edit review view
router.get("/edit/:review_id", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.buildEditReview))

// Process edit review
router.post("/edit", 
  utilities.checkLogin,
  reviewValidation.reviewValidationRules(),
  reviewValidation.checkUpdateReviewData,
  utilities.handleErrors(reviewController.updateReview))

// Delete review
router.get("/delete/:review_id", 
  utilities.checkLogin, 
  utilities.handleErrors(reviewController.deleteReview))

module.exports = router