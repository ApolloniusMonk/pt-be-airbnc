const db = require("../db/db-connection-pool");

exports.fetchProperties = async (filters = {}) => {
  const { property_type, maxprice, minprice, sort, order } = filters;

  let query = `
    SELECT 
      p.property_id,
      p.name AS property_name,
      p.location,
      p.price_per_night,
      pt.property_type,
      u.first_name || ' ' || u.surname AS host,
      COALESCE(ARRAY_AGG(i.image_url ORDER BY i.image_id) FILTER (WHERE i.image_url IS NOT NULL), '{}') AS images
    FROM properties p
    JOIN users u ON p.host_id = u.user_id
    JOIN property_types pt ON p.property_type = pt.property_type
    LEFT JOIN images i ON i.property_id = p.property_id

  `;

  const queryValues = [];
  const conditions = [];

  if (property_type) {
    conditions.push(`p.property_type = $${queryValues.length + 1}`);
    queryValues.push(property_type);
  }

  if (maxprice) {
    conditions.push(`p.price_per_night <= $${queryValues.length + 1}`);
    queryValues.push(maxprice);
  }

  if (minprice) {
    conditions.push(`p.price_per_night >= $${queryValues.length + 1}`);
    queryValues.push(minprice);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }

  query += `
  GROUP BY
  p.property_id,
  p.name,
  p.location,
  p.price_per_night,
  pt.property_type,
  u.first_name,
  u.surname
 `;

  const sortColumnMap = {
    cost_per_night: "p.price_per_night",
    popularity: "favourite_count",
  };

  const sortBy = sortColumnMap[sort] || "p.property_id";
  const orderBy = order === "descending" ? "DESC" : "ASC";

  if (sort === "popularity") {
    query = `
      SELECT 
        p.property_id,
        p.name AS property_name,
        p.location,
        p.price_per_night,
        pt.property_type,
        u.first_name || ' ' || u.surname AS host,
        COALESCE(ARRAY_AGG(DISTINCT i.image_url) FILTER (WHERE i.image_url IS NOT NULL), '{}') AS images,
        COUNT(f.favourite_id)::INT AS favourite_count
      FROM properties p
      JOIN users u ON p.host_id = u.user_id
      JOIN property_types pt ON p.property_type = pt.property_type
      LEFT JOIN favourites f ON f.property_id = p.property_id
      ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
      GROUP BY p.property_id, p.name, p.location, p.price_per_night, pt.property_type, u.first_name, u.surname
      ORDER BY ${sortBy} ${orderBy};
    `;
  } else {
    query += ` ORDER BY ${sortBy} ${orderBy};`;
  }

  const { rows } = await db.query(query, queryValues);
  return rows;
};

// exports.fetchPropertyById = async (id) => {
//   const query = `

//     SELECT
//       p.property_id,
//       p.name AS property_name,
//       p.location,
//       p.price_per_night,
//       p.description,
//       u.first_name || ' ' || u.surname AS host,

//       COALESCE(ARRAY_AGG(i.image_url ORDER BY i.image_id) FILTER (WHERE i.image_url IS NOT NULL), '{}') AS images,
//       COUNT(f.favourite_id)::INT AS favourite_count
//     FROM properties p
//     JOIN users u ON p.host_id = u.user_id
//     LEFT JOIN images i ON i.property_id = p.property_id
//     LEFT JOIN favourites f ON f.property_id = p.property_id
//     WHERE p.property_id = $1
//     GROUP BY p.property_id, u.first_name, u.surname;
//   `;

//   const { rows } = await db.query(query, [id]);

//   if (rows.length === 0) {
//     const err = new Error(`Property with ID ${id} not found.`);
//     err.status = 404;
//     err.msg = `Property with id ${id} not found.`;
//     throw err;
//   }
//   console.log(query);
//   return rows[0];
// };

exports.fetchPropertyById = async (id) => {
  const query = `

    SELECT
      p.property_id,
      p.name AS property_name,
      p.location,
      p.price_per_night,
      p.description,
      p.host_id,
      u.first_name || ' ' || u.surname AS host,

      COALESCE(img.images, '{}') AS images,
      COALESCE(fav.favourite_count, 0)::INT AS favourite_count

    FROM properties p
    JOIN users u ON p.host_id = u.user_id

    LEFT JOIN (
    SELECT property_id, ARRAY_AGG(image_url ORDER BY image_id) AS images
    FROM images
    GROUP BY property_id
    ) img ON img.property_id = p.property_id

    LEFT JOIN (
    SELECT property_id, COUNT(*) AS favourite_count
    FROM favourites
    GROUP BY property_id
    ) fav ON fav.property_id = p.property_id

    WHERE p.property_id = $1;
  `;

  const { rows } = await db.query(query, [id]);

  if (rows.length === 0) {
    const err = new Error(`Property with ID ${id} not found.`);
    err.status = 404;
    err.msg = `Property with id ${id} not found.`;
    throw err;
  }
  console.log(query);
  return rows[0];
};

exports.fetchReviewsByPropertyId = async (propertyId) => {
  const reviewsQuery = `SELECT
   r.review_id,
   r.comment,
   r.rating,
   r.created_at,
   (u.first_name || ' ' || u.surname) AS guest,
   u.avatar AS guest_avatar
   FROM reviews r
   JOIN users u ON r.guest_id = u.user_id
   WHERE r.property_id = $1
   ORDER BY r.created_at DESC;`;

  const averageQuery = `
   SELECT AVG(rating) AS average_rating
   FROM reviews
   WHERE property_id = $1`;

  const { rows: reviews } = await db.query(reviewsQuery, [propertyId]);
  const { rows: averageRows } = await db.query(averageQuery, [propertyId]);
  const average = averageRows[0].average_rating;

  let average_rating;

  if (averageRows[0].average_rating) {
    average_rating = Number(averageRows[0].average_rating);
  } else {
    average_rating = null;
  }

  return { reviews, average_rating };
};
