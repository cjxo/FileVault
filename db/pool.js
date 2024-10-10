import pg from 'pg';
import 'dotenv/config';

const pool = new pg.Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
});

pool.on('connect', (client) => {
});

pool.on('error', (err) => {
  console.error(err);
});

export default pool;
