const db = require("./db-connection-pool");
const format = require("pg-format");

async function seed(property_types, users) {

  await db.query(`DROP TABLE IF EXISTS users;`);
  await db.query(`DROP TABLE IF EXISTS property_types;`);
  

  await db.query(`CREATE TABLE property_types(
                property_type VARCHAR PRIMARY KEY NOT NULL,
                description TEXT
                );`);
  
  await db.query(`CREATE TABLE users(
                user_id SERIAL PRIMARY KEY,
                first_name VARCHAR NOT NULL,
                surname VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                phone_number VARCHAR NOT NULL,
                is_host BOOLEAN NOT NULL,
                avatar VARCHAR,
                created_at TIMESTAMP DEFAULT NOW()
                );`);
  
  await db.query(
    format(`INSERT INTO property_types (property_type, description) VALUES %L`,
      property_types.map(({property_type, description}) => [property_type, description])
    )
  );
   await db.query(
    format(`INSERT INTO users (user_id, first_name, surname, email, phone_number, is_host, avatar, created_at) VALUES %L `,
      users.map(({user_id, first_name, surname, email, phone_number, is_host, avatar, created_at}) => 
                 [user_id, first_name, surname, email, phone_number, is_host, avatar, created_at])
    )
  );

                

}

module.exports = seed;
