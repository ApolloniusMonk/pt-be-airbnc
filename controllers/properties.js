const {
  fetchProperties,
  fetchPropertyById,
  fetchReviewsByPropertyId,
} = require("../models/properties");

exports.getProperties = async (req, res, next) => {
  const { property_type, maxprice, minprice } = req.query;
  const properties = await fetchProperties(property_type, maxprice, minprice);
  res.status(200).send({ properties });
};

exports.getPropertyById = async (req, res, next) => {
  const { id } = req.params;

  const property = await fetchPropertyById(id);
  res.status(200).send({ property });
};

exports.getReviewsByPropertyId = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { reviews, average_rating } = await fetchReviewsByPropertyId(id);
    if (!reviews || reviews.length === 0) {
      return next({ msg: "Property not found." });
    }
    res.status(200).send({ reviews, average_rating });
  } catch (err) {
    next(err);
  }
};
