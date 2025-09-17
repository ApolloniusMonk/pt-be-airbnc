const db = require("./db-connection-pool");

async function seed() {

  await db.query(`DROP TABLE property_types;`);

  await db.query(`CREATE TABLE property_types(
                property_type VARCHAR PRIMARY KEY NOT NULL,
                description TEXT)`);

}

module.exports = seed;
