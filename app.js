const express = require("express");
const db = require("./db/db-connection-pool");
const {
  getProperties,
  getPropertyById,
  getReviewsByPropertyId,
  postReviewForProperty,
  
} = require("./controllers/properties");

const { getUserById } = require("./controllers/users");
const { deleteReview} = require("./controllers/reviews")

const {
  handlePathNotFound,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors");

const app = express();

app.use(express.static("public"))
app.use(express.json());

app.get("/api/properties", getProperties);
app.get("/api/properties/:id", getPropertyById);
app.get("/api/properties/:id/reviews", getReviewsByPropertyId);
app.get("/api/users/:id", getUserById);
app.post("/api/properties/:id/reviews", postReviewForProperty);
app.delete("/api/reviews/:id", deleteReview )

// 404 for invalid routes
app.all("/*path", handlePathNotFound);

// error handlers
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
