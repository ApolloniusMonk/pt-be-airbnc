const express = require("express");
const db = require("./db/db-connection-pool");
const { getProperties } = require("./controllers/properties");

const app = express();

app.use(express.json());

app.get("/api/properties", getProperties);

app.all("/*path", (req, res, next) => {
  res.status(404).send({ msg: "Path not found." });
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Server error." });
});
module.exports = app;
