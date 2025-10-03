const express = require("express");
const db = require("./db/db-connection-pool");
const { getProperties } = require("./controllers/properties");

const app = express();

app.use(express.json());

app.get("/api/properties", getProperties);

module.exports = app;
