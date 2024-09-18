import cors from 'cors';
import express from 'express';

// import corsConfig from './config/cors.js';
import { mongo } from './db/mongo.js';

import authRoutes from './routes/auth.js';
import factsRoutes from './routes/facts.js';
import usersRoutes from './routes/users.js';

const app = express();
app.use(express.json());
// app.use(cors(corsConfig));
app.use(cors());

// routes
app.use('/api/auth', authRoutes);
app.use('/api/facts', factsRoutes);
app.use('/api/users', usersRoutes);

// ping
app.use('/api/ping', (_, res) => res.send({ message: 'Ping OK' }));

// connect to DB
mongo.connect().then(() => app.listen(process.env.PORT));
