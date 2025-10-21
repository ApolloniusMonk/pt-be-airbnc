const db = require("../db/db-connection-pool");

exports.insertReview = async ({ propertyId, guestId, rating, comment }) => {
    const query = `
    INSERT INTO reviews (property_id, guest_id, rating, comment)
    VALUES ($1, $2, $3, $4)
    RETURNING review_id, property_id, guest_id, rating, comment, created_at;
    `;
    const { rows } = await db.query(query, [propertyId, guestId, rating, comment])
    return rows[0]
}

exports.deleteReviewById = async (id) => {
  const { rows } = await db.query("DELETE FROM reviews WHERE review_id = $1 RETURNING *;", [id]);
  if (rows.length === 0) {
    const err = new Error(`Review with ID ${id} not found.`);
    err.status = 404;
    err.msg = `Review with ID ${id} not found.`;
    throw err;
  }
  return;
};