const db = require("../db/db-connection-pool");

exports.fetchProperties = async (propertyType) => {
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

  if (propertyType) {
    query += `WHERE properties.property_type = $1;`;
    queryValues.push(propertyType);
  }
  const { rows } = await db.query(query, queryValues);

  return rows;
};
