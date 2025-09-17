const db = require("./db-connection-pool");

async function seed() {
  await db.query(`CREATE TABLE property_types(
                property_type VARCHAR PRIMARY KEY NOT NULL,
                description TEXT)`);
  console.log("Success!");
}

module.exports = seed;
