const pool = require("../database/")

async function getReviewsByVehicleId(inv_id) {
  try {
    const sql = `
      SELECT r.review_id, r.review_rating, r.review_title, r.review_text, r.review_date,
             a.account_firstname, a.account_lastname
      FROM reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByVehicleId error: " + error)
    return []
  }
}

async function addReview(inv_id, account_id, review_rating, review_title, review_text) {
  try {
    const sql = `
      INSERT INTO reviews (inv_id, account_id, review_rating, review_title, review_text)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const result = await pool.query(sql, [inv_id, account_id, review_rating, review_title, review_text])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

async function getAverageRating(inv_id) {
  try {
    const sql = `
      SELECT AVG(review_rating)::NUMERIC(3,2) as avg_rating, COUNT(*) as review_count
      FROM reviews
      WHERE inv_id = $1
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("getAverageRating error: " + error)
    return { avg_rating: null, review_count: 0 }
  }
}

async function checkExistingReview(inv_id, account_id) {
  try {
    const sql = "SELECT review_id FROM reviews WHERE inv_id = $1 AND account_id = $2"
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("checkExistingReview error: " + error)
    return false
  }
}

async function getReviewsByAccountId(account_id) {
  try {
    const sql = `
      SELECT r.review_id, r.review_rating, r.review_title, r.review_text, r.review_date,
             i.inv_make, i.inv_model, i.inv_year, r.inv_id
      FROM reviews r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.account_id = $1
      ORDER BY r.review_date DESC
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getReviewsByAccountId error: " + error)
    return []
  }
}

async function deleteReview(review_id, account_id) {
  try {
    const sql = "DELETE FROM reviews WHERE review_id = $1 AND account_id = $2"
    const result = await pool.query(sql, [review_id, account_id])
    return result.rowCount > 0
  } catch (error) {
    console.error("deleteReview error: " + error)
    return false
  }
}

async function updateReview(review_id, account_id, review_rating, review_title, review_text) {
  try {
    const sql = `
      UPDATE reviews 
      SET review_rating = $3, review_title = $4, review_text = $5
      WHERE review_id = $1 AND account_id = $2
      RETURNING *
    `
    const result = await pool.query(sql, [review_id, account_id, review_rating, review_title, review_text])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

async function getReviewById(review_id) {
  try {
    const sql = `
      SELECT r.*, i.inv_make, i.inv_model, i.inv_year
      FROM reviews r
      JOIN inventory i ON r.inv_id = i.inv_id
      WHERE r.review_id = $1
    `
    const result = await pool.query(sql, [review_id])
    return result.rows[0]
  } catch (error) {
    console.error("getReviewById error: " + error)
    return null
  }
}

module.exports = {
  getReviewsByVehicleId,
  addReview,
  getAverageRating,
  checkExistingReview,
  getReviewsByAccountId,
  deleteReview,
  updateReview,
  getReviewById
}