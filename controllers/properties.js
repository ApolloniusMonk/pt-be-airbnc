const {
  fetchProperties,
  fetchPropertyById,
  fetchReviewsByPropertyId,
} = require("../models/properties");

exports.getProperties = async (req, res, next) => {
  try {
    const { property_type, maxprice, minprice } = req.query;

    if ((minprice && isNaN(minprice)) || (maxprice && isNaN(maxprice))) {
      return next({ status: 400, msg: "Invalid query parameter." });
    }
    const properties = await fetchProperties(property_type, maxprice, minprice);

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
  try {
    const { id } = req.params;

    const property = await fetchPropertyById(id);
    res.status(200).send({ property });
  } catch (err) {
    next(err);
  }
};

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
};
