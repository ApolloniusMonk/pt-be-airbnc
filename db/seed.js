console.log(">>>seeding started");

const db = require("./db-connection-pool");

const format = require("pg-format");
const {
  addUserDefaults,
  formatProperties,
  formatReviews,
  formatImages,
} = require("./utils");
const dropTables = require("./queries/drops");

async function seed(property_types, users, properties, reviews, images) {
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
                );`);

  await db.query(`CREATE TABLE reviews(
                review_id SERIAL PRIMARY KEY,
                property_id INT NOT NULL REFERENCES properties(property_id),
                guest_id INT NOT NULL REFERENCES users(user_id),
                rating INT NOT NULL,
                comment TEXT,
                created_at TIMESTAMP DEFAULT NOW()
                );`);

  await db.query(`CREATE TABLE images (
                image_id SERIAL PRIMARY KEY,
                property_id INT NOT NULL REFERENCES properties(property_id),
                image_url VARCHAR NOT NULL,
                alt_text VARCHAR NOT NULL);`);

  await db.query(
    format(
      `INSERT INTO property_types (property_type, description) VALUES %L`,
      property_types.map(({ property_type, description }) => [
        property_type,
        description,
      ])
    )
  );

  const usersWithDefaults = addUserDefaults(users);

  await db.query(
    format(
      `INSERT INTO users (user_id, first_name, surname, email, phone_number, is_host, avatar, created_at) VALUES %L `,
      usersWithDefaults.map(
        ({
          user_id,
          first_name,
          surname,
          email,
          phone_number,
          is_host,
          avatar,
          created_at,
        }) => [
          user_id,
          first_name,
          surname,
          email,
          phone_number,
          is_host,
          avatar,
          created_at,
        ]
      )
    )
  );

  const formattedProperties = formatProperties(properties, usersWithDefaults);

  await db.query(
    format(
      `INSERT INTO properties (host_id, name, location, property_type, price_per_night, description) VALUES %L`,
      formattedProperties.map(
        ({
          host_id,
          name,
          location,
          property_type,
          price_per_night,
          description,
        }) => [
          host_id,
          name,
          location,
          property_type,
          price_per_night,
          description,
        ]
      )
    )
  );

  const { rows: insertedUsers } = await db.query(
    "SELECT user_id, first_name, surname FROM users;"
  );
  const { rows: insertedProperties } = await db.query(
    "SELECT property_id, name FROM properties;"
  );

  const formattedReviews = formatReviews(
    reviews,
    insertedUsers,
    insertedProperties
  );

  await db.query(
    format(
      `INSERT INTO reviews (property_id, guest_id, rating, comment, created_at) VALUES %L`,
      formattedReviews.map(
        ({ property_id, guest_id, rating, comment, created_at }) => [
          property_id,
          guest_id,
          rating,
          comment,
          created_at,
        ]
      )
    )
  );

  const formattedImages = formatImages(images, insertedProperties);

  await db.query(
    format(
      `INSERT INTO images (property_id, image_url, alt_text) VALUES %L`,
      formattedImages.map(({ property_id, image_url, alt_text }) => [
        property_id,
        image_url,
        alt_text,
      ])
    )
  );
}

module.exports = seed;
