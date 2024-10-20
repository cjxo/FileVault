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

const getRecentUploads = async (user_id) => {
  const SELECTSQL = `
    SELECT name FROM fv_recent_uploads
    WHERE user_id = $1;
  `;

  const selectResult = await pool.query(SELECTSQL, [user_id]);
  return selectResult.rows[0].name;
};

const createNewRecentUpload = async (filename, upload_by_id) => {
  try {
    const SELECTSQL = `
      SELECT name FROM fv_recent_uploads
      WHERE user_id = $1;
    `;

    const selectResult = await pool.query(SELECTSQL, [upload_by_id]);

    const newArray = [filename];
    if (selectResult.rowCount) {
      const oldArray = selectResult.rows[0].name;
      newArray.push(...oldArray.slice(0, 5));
    }

    const INSERTSQL = `
      INSERT INTO fv_recent_uploads (name, user_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id)
      DO UPDATE SET name = EXCLUDED.name;
    `;

    await pool.query(INSERTSQL, [newArray, upload_by_id]);
  } catch (err) {
    console.log("failed to insert new recently uploaded file: ", err);
  }
};

export default {
  getUserFromUsername,
  getUserFromEmail,
  createNewUser,
  createNewRecentUpload,
  getRecentUploads,
};
