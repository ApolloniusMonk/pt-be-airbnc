const db = require("../db/db-connection-pool");

exports.fetchProperties = async (propertyType, maxPrice, minPrice) => {
  let query = `SELECT 
                 properties.property_id,
                 properties.name AS property_name,
                 properties.location,
                 properties.price_per_night,
                 property_types.property_type,
                 users.first_name || ' ' || users.surname AS host 
                 FROM properties
                 JOIN users ON properties.host_id = users.user_id
                 JOIN property_types ON properties.property_type = property_types.property_type

                `;
  const queryValues = [];
  const conditions = [];

  if (propertyType) {
    conditions.push(`properties.property_type = $${queryValues.length + 1}`);
    queryValues.push(propertyType);
  }
  if (maxPrice) {
    conditions.push(`properties.price_per_night <= $${queryValues.length + 1}`);
    queryValues.push(maxPrice);
  }
  if (minPrice) {
    conditions.push(`properties.price_per_night >= $${queryValues.length + 1}`);
    queryValues.push(minPrice);
  }
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  const { rows } = await db.query(query, queryValues);

  return rows;
};

exports.fetchPropertyById = async (id) => {
  const query = `
            
    SELECT
      p.property_id,
      p.name AS property_name,
      p.location,
      p.price_per_night,
      p.description,
      u.first_name || ' ' || u.surname AS host,
      i.image_url AS host_avatar,
      COUNT(f.favourite_id)::INT AS favourite_count
    FROM properties p
    JOIN users u ON p.host_id = u.user_id
    LEFT JOIN images i ON i.property_id = p.property_id
    LEFT JOIN favourites f ON f.property_id = p.property_id
    WHERE p.property_id = $1
    GROUP BY p.property_id, u.first_name, u.surname, i.image_url;
  `;

  const { rows } = await db.query(query, [id]);

  if (rows.length === 0) {
    const err = new Error(`Property with ID ${id} not found.`);
    err.status = 404;
    throw err;
  }

  return rows[0];
};
