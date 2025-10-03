const db = require("../db/db-connection-pool");

exports.fetchProperties = async () => {
  const query = `SELECT 
                 properties.property_id,
                 properties.name AS property_name,
                 properties.location,
                 properties.price_per_night,
                 users.first_name || ' ' || users.surname AS host 
                 FROM properties
                 JOIN users ON properties.host_id = users.user_id;

                `;

  const { rows } = await db.query(query);

  return rows;
};
