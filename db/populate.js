import pg from 'pg';
import 'dotenv/config';

const SQL = `
  DROP TABLE IF EXISTS fv_folder;
  DROP TABLE IF EXISTS fv_uploaded_file;
  DROP TABLE IF EXISTS fv_user
  CREATE TABLE IF NOT EXISTS fv_user (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS fv_uploaded_file (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) UNIQUE NOT NULL,
    upload_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES fv_user (id)
  );

  CREATE TABLE IF NOT EXISTS fv_folder (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    parent_folder_id INTEGER REFERENCES fv_folder(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES fv_user (id)
  );
`;

const main = async () => {
  console.log('seeding...');

  const client = new pg.Client({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
  });

  await client.connect();
  
  try {
    await client.query(SQL);
  } catch (err) {
    console.log("Error: ", err);
  }
  /*
  const SQL2 = `
    SELECT name FROM fv_recent_uploads
    WHERE user_id = 1;
  `;
  const result = await client.query(SQL2);
  console.log(...result.rows[0].name);*/
  await client.end();
};

main();
