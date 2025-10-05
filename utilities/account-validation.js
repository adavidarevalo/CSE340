const { body, validationResult } = require('express-validator');
const accountModel = require('../models/account-model');
const utilities = require('.');

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
const registrationRules = () => {
  return [
    // firstname is required and must be string
    body('first_name')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Please provide a first name.'),

    // lastname is required and must be string
    body('last_name')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Please provide a last name.'),

    // valid email is required
    body('email')
      .trim()
      .isEmail()
      .withMessage('A valid email is required.')
      .normalizeEmail()
      .custom(async (email) => {
        // Check if email exists in database (to prevent duplicate registrations)
        // This is placeholder code - you'll need to implement the actual database check
        // const emailExists = await accountModel.checkExistingEmail(email)
        // if (emailExists){
        //   throw new Error("Email already exists. Please log in or use a different email")
        // }
      }),

    // password is required and must be strong password
    body('password')
      .trim()
      .isLength({ min: 12 })
      .withMessage('Password must be at least 12 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least 1 uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least 1 number')
      .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
      .withMessage('Password must contain at least 1 special character')
  ]
}

/* ******************************
 * Check data and return errors
 * ***************************** */
const checkRegData = async (req, res, next) => {
  const { first_name, last_name, email } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors,
      title: "Register",
      nav,
      first_name,
      last_name,
      email,
    });
    return;
  }
  next();
}

// Account update validation rules
const accountUpdateValidation = () => {
  return [
    // firstname is required and must be string
    body('account_firstname')
      .trim()
      .isLength({ min: 1 })
      .withMessage('First name is required.'),

    // lastname is required and must be string
    body('account_lastname')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Last name is required.'),

    // valid email is required
    body('account_email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('A valid email is required.')
      .custom(async (account_email, { req }) => {
        const account_id = req.body.account_id
        const accountData = await accountModel.getAccountById(account_id)
        
        // If email changed, check if new email exists
        if (account_email !== accountData.account_email) {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists) {
            throw new Error("Email already exists. Please use a different email")
          }
        }
        return true
      }),
  ]
}

// Password validation rules
const passwordValidation = () => {
  return [
    body('account_password')
      .trim()
      .isLength({ min: 12 })
      .withMessage('Password must be at least 12 characters')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least 1 uppercase letter')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least 1 number')
      .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
      .withMessage('Password must contain at least 1 special character'),
  ]
}

module.exports = { 
  registrationRules, 
  checkRegData,
  accountUpdateValidation,
  passwordValidation 
}
