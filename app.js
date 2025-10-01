const express = require("express");
const db = require("./db/db-connection-pool");

const app = express();

app.use(express.json());

app.get("/api/properties", async (req, res, next) => {
  const query = `SELECT 
                 property_id,
                 name AS property_name,
                 location,
                 price_per_night,
                 host_name AS host
                 FROM properties;

                 `;
  await db.query(query).then((result) => {
    res.status(200).send({ properties: result.row });
  });
});

module.exports = app;
