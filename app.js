const express = require("express");
const db = require("./db/db-connection-pool");

const app = express();

app.use(express.json());

app.get("/api/properties", async (req, res, next) => {
  const query = `SELECT 
                 property_id,
                 name AS property_name,
                 location,
                 price_per_night          
                 FROM properties;
                `;
  const { rows } = await db.query(query);

  res.status(200).send({ properties: rows });
});

module.exports = app;
