const db = require("../db/db-connection-pool");

exports.fetchUserById = async (id) => {
  const query = `
  SELECT user_id, first_name, surname, email, phone_number, avatar, created_at
  FROM users
  WHERE user_id = $1
  `;

  const { rows } = await db.query(query, [id]);

  if(rows.length === 0) {
    const err = new Error(`User with ID ${id} not found.`);
    err.status = 404 ;
    err.msg = `User with id ${id} not found.`;
    throw err;
  }
  return rows[0]
}