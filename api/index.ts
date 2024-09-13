import cors from 'cors';
import express from 'express';

import { mongo } from './src/db/mongo.js';
import { HttpError } from './src/utils/error.js';

import authRoutes from './src/routes/auth.js';
import usersRoutes from './src/routes/users.js';

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Ping
app.use('/api/ping', (req, res) => {
  res.send({
    message: 'Ping OK',
  });
});

// 404
app.use((req, res, next) => {
  next(new HttpError('Requested url is not found', 404));
});

// Connect to DB
mongo.connect().then(() => app.listen(process.env.PORT));
