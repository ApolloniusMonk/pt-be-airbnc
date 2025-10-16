exports.handlePathNotFound = (req, res, next) => {
  res.status(404).send({ msg: "Path not found." });
};

exports.handlePropertyNotFound = (err, req, res, next) => {
  res.status(404).send({ msg: "Property not found." });
};

exports.handleServerErrors = (err, req, res, next) => {
  res.status(500).send({ msg: "Server error." });
};
