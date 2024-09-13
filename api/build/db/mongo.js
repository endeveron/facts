import mongoose from 'mongoose';
import logger from '../utils/logger.js';
const uri = process.env.DB_CONNECTION_STRING;
const options = {};
const mongo = {
    connect: async () => {
        try {
            await mongoose.connect(uri, options);
            logger.b('Connected to database');
        }
        catch (err) {
            logger.r('Database connection error', err);
        }
    },
};
export { mongo };
