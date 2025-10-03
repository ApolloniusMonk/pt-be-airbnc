const { fetchProperties } = require("../models/properties");

exports.getProperties = async (req, res, next) => {
  const properties = await fetchProperties();
  res.status(200).send({ properties });
};
