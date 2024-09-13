import mongoose, { ConnectOptions } from 'mongoose';

import logger from '../utils/logger.js';

const uri = process.env.DB_CONNECTION_STRING as string;
// const uri = 'mongodb://localhost:27017/authapi';
const options = {};

const mongo = {
  connect: async () => {
    try {
      await mongoose.connect(uri, options as ConnectOptions);
      logger.b('Connected to database');
    } catch (err) {
      logger.r('Database connection error', err);
    }
  },
};

export { mongo };
