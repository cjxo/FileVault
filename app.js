import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pool from './db/pool.js';
import fvSession from './passport/setup.js';

import idxRouter from './routes/index_route.js';

const app = express();
const directoryName = path.dirname(fileURLToPath(import.meta.url));

app.use(fvSession);
app.set('views', path.join(directoryName, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(directoryName, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', idxRouter);

app.listen(3000, () => {
  console.log('Hello, World!');
});
