const { body, validationResult } = require("express-validator")
const validate = {}

validate.reviewValidationRules = () => {
  return [
    body("review_rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    body("review_title")
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Review title is required and must be less than 100 characters.")
      .matches(/^[a-zA-Z0-9\s\-.,!?']+$/)
      .withMessage("Review title contains invalid characters."),

    body("review_text")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review text must be between 10 and 1000 characters.")
      .matches(/^[a-zA-Z0-9\s\-.,!?'"\n\r]+$/)
      .withMessage("Review text contains invalid characters."),
  ]
}

validate.checkReviewData = async (req, res, next) => {
  const { inv_id, review_rating, review_title, review_text } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const invModel = require("../models/inventory-model")
    let nav = await require("../utilities/").getNav()
    const vehicle = await invModel.getVehicleDetails(inv_id)
    res.render("reviews/add-review", {
      errors,
      title: `Review ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
      review_rating,
      review_title,
      review_text,
    })
    return
  }
  next()
}

validate.checkUpdateReviewData = async (req, res, next) => {
  const { review_id, review_rating, review_title, review_text } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    const reviewModel = require("../models/review-model")
    let nav = await require("../utilities/").getNav()
    const review = await reviewModel.getReviewById(review_id)
    res.render("reviews/edit-review", {
      errors,
      title: `Edit Review for ${review.inv_make} ${review.inv_model}`,
      nav,
      review: {
        ...review,
        review_rating,
        review_title,
        review_text
      },
    })
    return
  }
  next()
}

module.exports = validate