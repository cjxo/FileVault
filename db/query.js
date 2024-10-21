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

  const RECENTUPLOADS_SQL = `
    INSERT INTO fv_recent_uploads (name, user_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id)
    DO UPDATE SET name = EXCLUDED.name;
  `;

  // add to recent uploads
  await pool.query(RECENTUPLOADS_SQL, [newArray, upload_by_id]);

  // add to files of user (if not exists)
  const UPLOADEDFILE_SQL = `
    INSERT INTO fv_uploaded_file (name, uploaded_by)
    VALUES ($1, $2)
    ON CONFLICT (name) DO NOTHING;
  `;

  await pool.query(UPLOADEDFILE_SQL, [filename, upload_by_id]);
};

const getFileIDFromFilename = async (filename, user_id) => {
  const SQL = `
    SELECT id FROM fv_uploaded_file
    WHERE (uploaded_by = $1) AND (name = $2);
  `;

  const { rows } = await pool.query(SQL, [user_id, filename]);
  if (rows) {
    return rows[0].id;
  } else {
    return null;
  }
};

export default {
  getUserFromUsername,
  getUserFromEmail,
  createNewUser,
  createNewRecentUpload,
  getRecentUploads,
  getFileIDFromFilename,
};
