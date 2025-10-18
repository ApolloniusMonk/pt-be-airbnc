const express = require("express");
const db = require("./db/db-connection-pool");
const {
  getProperties,
  getPropertyById,
  getReviewsByPropertyId,
} = require("./controllers/properties");
const {
  handlePathNotFound,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors");

const app = express();

app.use(express.json());

app.get("/api/properties", getProperties);
app.get("/api/properties/:id", getPropertyById);
app.get("/api/properties/:id/reviews", getReviewsByPropertyId);

// 404 for invalid routes
app.all("/*path", handlePathNotFound);

// error handlers
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
