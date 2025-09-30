const express = require("express");
const db = require("./db/db-connection-pool");

const app = express();

app.get("/api/properties", (req, res, next) => {
  res.status(200).send();
});

module.exports = app;
