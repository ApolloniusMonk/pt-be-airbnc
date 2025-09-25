const db = require("./db-connection-pool");
const format = require("pg-format");
const addUserDefaults = require("./utils");
const dropTables = require("./queries/drops")

async function seed(property_types, users, properties) {
  
  await dropTables();


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

  await db.query(`CREATE TABLE properties(
                property_id SERIAL PRIMARY KEY,
                host_id INT NOT NULL REFERENCES users(user_id),
                name VARCHAR NOT NULL,
                location VARCHAR NOT NULL,
                property_type VARCHAR NOT NULL REFERENCES property_types(property_type),
                price_per_night DECIMAL NOT NULL,
                description TEXT
                );`)              
  
  await db.query(
    format(`INSERT INTO property_types (property_type, description) VALUES %L`,
      property_types.map(({property_type, description}) => [property_type, description])
    )
  );

   const usersWithDefaults = addUserDefaults(users)

   await db.query(
    format(`INSERT INTO users (user_id, first_name, surname, email, phone_number, is_host, avatar, created_at) VALUES %L `,
      usersWithDefaults.map(({user_id, first_name, surname, email, phone_number, is_host, avatar, created_at}) => 
                             [user_id, first_name, surname, email, phone_number, is_host, avatar, created_at])
    )
  );
  await db.query(
    format(`INSERT INTO properties (host_id, name, location, property_type, price_per_night, description) VALUES %L`,
      properties.map(({host_id, name, location, property_type, price_per_night, description}) => 
                      [host_id, name, location, property_type, price_per_night, description])
    )
  );

                

}

module.exports = seed;
