import express from 'express';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import bcrypt from 'bcryptjs';
import pool from '../db/pool.js';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import 'dotenv';

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const SQL = `
      SELECT * FROM fv_user
      WHERE username = $1;
    `;
    try {
      const { rows } = await pool.query(SQL, [username]);
      const user = rows[0];

      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }

      const passwordsMatched = await bcrypt.compare(password, user.password);
      if (!passwordsMatched) {
        return done(null, false, { message: 'Incorrect password' });
      }

      return done(null, user);
    } catch (err) {
      return done(null, false, { message: err });
    }
  })
);

const pgSession = ConnectPgSimple(session);
const fvSession = session({
  store: new pgSession({
    pool: pool,
    tableName: 'fv_sessions',
    createTableIfMissing: true
  }),
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET,
  resave: false,
  cookie: { 
    maxAge: 30 * 24 * 60 * 60 * 1000
  },
});

export default fvSession;
