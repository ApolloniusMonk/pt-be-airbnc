const { fetchProperties, fetchPropertyById } = require("../models/properties");

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
