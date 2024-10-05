import cors from 'cors';
import express from 'express';

import { mongo } from './db/mongo';

import authRoutes from './routes/auth';
import factsRoutes from './routes/facts';
import usersRoutes from './routes/users';
import notificationsRoutes from './routes/notifications';

const app = express();
app.use(express.json());
app.use(cors());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/facts', factsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/notifications', notificationsRoutes);

// ping
app.use('/api/ping', (req, res) => {
  res.status(200).json({ message: 'Ping OK' });
});

// connect to DB
mongo.connect().then(() => app.listen(process.env.PORT));

// app.listen(port, () => {
//   return console.log(
//     `🚀 Express server is listening at http://localhost:${port}`
//   );
// });
