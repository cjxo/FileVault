import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './db/pool.js';
import { fvSession } from './passport/setup.js';
import passport from 'passport';
import idxRouter from './routes/index_route.js';

const app = express();
const directoryName = path.dirname(fileURLToPath(import.meta.url));

app.use(fvSession);
app.use(passport.session());
app.set('views', path.join(directoryName, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(directoryName, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(req.user);
  next();
});

app.use('/', idxRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err);
});

app.listen(3000, () => {
  console.log('Hello, World!');
});
