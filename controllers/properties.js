const db = require("../db/db-connection-pool")

const { insertReview } = require("../models/reviews")

const {
  fetchProperties,
  fetchPropertyById,
  fetchReviewsByPropertyId,
 
} = require("../models/properties");

exports.getProperties = async (req, res, next) => {
  try {
    const { property_type, maxprice, minprice, sort, order } = req.query;

    if (
      (minprice && isNaN(Number(minprice))) ||
      (maxprice && isNaN(Number(maxprice)))
    ) {
      return next({ status: 400, msg: "Invalid query parameter." });
    }

    const validSortColumns = ["cost_per_night", "popularity"];
    const validOrders = ["ascending", "descending"];

    if (sort && !validSortColumns.includes(sort)) {
      return next({ status: 400, msg: "Invalid sort query." });
    }

    if (order && !validOrders.includes(order)) {
      return next({ status: 400, msg: "Invalid order query." });
    }

    const filters = { property_type, maxprice, minprice, sort, order };
    const properties = await fetchProperties(filters);

    if (!properties.length) {
      return next({
        status: 404,
        msg: "No properties found for given filters.",
      });
    }

    res.status(200).send({ properties });
  } catch (err) {
    next(err);
  }
};


exports.getPropertyById = async (req, res, next) => {
  const { id } = req.params;
  const { user_id } = req.query;

  try{
    if (user_id && isNaN(Number(user_id))) {
      return next({ status: 400, msg: "Invalid user_id parameter."})
    }

    const property = await fetchPropertyById(id);
    if (!property) {
      return next({status: 404, msg: `Property with ${id} not found.`})
    }
    if(user_id) {
      const { rows } = await db.query(
        `SELECT 1 FROM favourites WHERE guest_id = $1 AND property_id = $2;`,
        [user_id, id]
      );
      property.favourited = rows.length > 0;
    }
    res.status(200).send({property})
  }catch(err) {
    console.error("X error in getPropertyById", err.message);
      next(err)
    }
  }

exports.getReviewsByPropertyId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { reviews, average_rating } = await fetchReviewsByPropertyId(id);
    if (!reviews || reviews.length === 0) {
      return next({
        status: 404,
        msg: `No reviews found for property id ${id}.`,
      });
    }
    res.status(200).send({ reviews, average_rating });
  } catch (err) {
    next(err);
  }
}

exports.postReviewForProperty = async(req, res, next) => {
  try {
    const { id: propertyId} = req.params;
    const { guest_id: guestId, rating, comment} = req.body;

    if (!guestId || rating === undefined) {
      return next({ status: 400, msg: "Missing required fields."})
    }
    if (isNaN(rating) || rating < 1 || rating > 5 ) {
      return next({status: 400, msg: "Invalid rating."})
    }
    try {
      await fetchPropertyById(propertyId);
    } catch (err) {
      return next (err);
    }

    const review = await insertReview({
      propertyId,
      guestId,
      rating,
      comment: comment || null,
    })

    res.status(201).send(review);

  }catch (err) {
    next (err)
  }
}