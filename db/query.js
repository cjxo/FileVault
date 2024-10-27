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

const deleteFolderFromName = async (name, user_id) => {
  const SQL = `
    DELETE FROM fv_folder
    WHERE created_by = $1 AND name = $2;
  `;
  await pool.query(SQL, [user_id, name]);
};

const addFilesToFolder = async (name, fileIDS, user_id) => {
  const SQL0 = `
    SELECT id FROM fv_folder
    WHERE created_by = $1 AND name = $2;
  `

  const SQL1 = `
    INSERT INTO fv_folder_file (file_id, folder_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING;
  `;

  const folder = await pool.query(SQL0, [user_id, name]);
  if (folder.rows.length === 0) {
    throw new Error("Folder doesn't exist!");
  }

  for (let idx = 0; idx < fileIDS.length; ++idx) {
    await pool.query(SQL1, [fileIDS[idx], folder.rows[0].id]);
  }
};

const getFilesFromFolderID = async (folder_id, user_id) => {
  const SQL = `
    SELECT ff.id, ff.file_id, uf.name FROM fv_folder_file AS ff
    INNER JOIN fv_uploaded_file as uf
    ON ff.file_id = uf.id
    WHERE (uf.uploaded_by = $1) AND (ff.folder_id = $2)
    ORDER BY ff.file_id ASC;
  `;

  const { rows } = await pool.query(SQL, [user_id, folder_id]);

  const folderName = await pool.query(`SELECT name FROM fv_folder WHERE (id = $1) AND (created_by = $2)`, [folder_id, user_id])
  return { name: folderName.rows[0].name, files: rows };
};

const removeFilesFromFolder = async (fileIds, folderId) => {
  const SQL = `
    DELETE FROM fv_folder_file
    WHERE (file_id = $1) AND (folder_id = $2);
  `;

  for (let idx = 0; idx < fileIds.length; ++idx) {
    await pool.query(SQL, [fileIds[idx], folderId]);
  }
};

const deleteFolders = async (folderIds, user_id) => {
  const SQL = `
    DELETE FROM fv_folder
    WHERE (id = $1) AND (created_by = $2);
  `;

  for (let idx = 0; idx < folderIds.length; ++idx) {
    await pool.query(SQL, [folderIds[idx], user_id]);
  }
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
  deleteFolderFromName,
  addFilesToFolder,
  getFilesFromFolderID,
  removeFilesFromFolder,
  deleteFolders,
};
