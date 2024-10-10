import pool from './pool.js';

const getUserFromUsername = async (username) => {
  const { rows } = await pool.query('SELECT * FROM fv_user WHERE username = $1;', [username]);
  return rows;
};

const getUserFromEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM fv_user WHERE email = $1;', [email]);
  return rows;
};

const createNewUser = async (email, username, password) => {
  const SQL = `
    INSERT INTO fv_user (email, username, password)
    VALUES ($1, $2, $3);
  `;

  await pool.query(SQL, [email, username, password]);
};

export default {
  getUserFromUsername,
  getUserFromEmail,
  createNewUser,
};
