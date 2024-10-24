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
    VALUES ($1, $2, $3)
    RETURNING id;
  `;

  const { rows } = await pool.query(SQL, [email, username, password]);
  return rows[0].id;
};

const createNewUpload = async (filename, upload_by_id) => {
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

const getFilenameFromFileID = async (file_id, user_id) => {
  const SQL = `
    SELECT name FROM fv_uploaded_file
    WHERE (uploaded_by = $1) AND (id = $2);
  `;

  const { rows } = await pool.query(SQL, [user_id, file_id]);
  if (rows) {
    return rows[0].name;
  } else {
    return null;
  }
};

const deleteFileFromIDAndReturnFileName = async (file_id, user_id) => {
  const DELETESQL = `
    DELETE FROM fv_uploaded_file
    WHERE (uploaded_by = $1) AND (id = $2);
  `;
  
  const SELECTSQL = `
    SELECT name FROM fv_uploaded_file
    WHERE (uploaded_by = $1) AND (id = $2);
  `;

  const selectResult = await pool.query(SELECTSQL, [user_id, file_id]);
  if (!selectResult) {
    return null;
  }

  await pool.query(DELETESQL, [user_id, file_id]);

  return selectResult.rows[0].name;
};

const checkFolderNameExists = async (name, user_id) => {
  const SQL = `
    SELECT name FROM fv_folder
    WHERE (name = $1) AND (created_by = $2);
  `;

  const { rows } = await pool.query(SQL, [name, user_id]);
  if (rows.length) {
    return true;
  } else {
    return false;
  }
};

const createFolder = async (name, user_id) => {
  const SQL = `
    INSERT INTO fv_folder (name, created_by)
    VALUES ($1, $2)
    RETURNING id;
  `;

  const { rows } = await pool.query(SQL, [name, user_id]);
  return rows[0].id;
};

const getFolders = async (user_id) => {
  const SQL = `
    SELECT * FROM fv_folder
    WHERE created_by = $1;
  `;
  const { rows } = await pool.query(SQL, [user_id]);
  return rows;
};

export default {
  getUserFromUsername,
  getUserFromEmail,
  createNewUser,
  createNewUpload,
  getFileIDFromFilename,
  getFilenameFromFileID,
  deleteFileFromIDAndReturnFileName,
  checkFolderNameExists,
  createFolder,
  getFolders,
};
