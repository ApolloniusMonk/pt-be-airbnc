const db = require("../db/db-connection-pool")

const { deleteReviewById } = require("../models/reviews")

exports.deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteReviewById(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};