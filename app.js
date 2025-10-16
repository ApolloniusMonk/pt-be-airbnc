const express = require("express");
const db = require("./db/db-connection-pool");
const {
  getProperties,
  getPropertyById,
  getReviewsByPropertyId,
} = require("./controllers/properties");
const {
  handlePathNotFound,
  handlePropertyNotFound,
  handleServerErrors,
} = require("./errors");

const app = express();

app.use(express.json());

app.get("/api/properties", getProperties);
app.get("/api/properties/:id", getPropertyById);
app.get("/api/properties/:id/reviews", getReviewsByPropertyId);

app.all("/*path", handlePathNotFound);
app.use(handlePropertyNotFound);
app.use(handleServerErrors);

module.exports = app;
