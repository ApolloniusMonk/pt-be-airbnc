const { fetchProperties } = require("../models/properties");

exports.getProperties = async (req, res, next) => {
  const { property_type } = req.query;
  const properties = await fetchProperties(property_type);
  res.status(200).send({ properties });
};
