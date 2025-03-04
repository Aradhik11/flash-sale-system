import mongoose from 'mongoose';
import logger from '../utils/logger';


const connectDB = async (): Promise<mongoose.Connection> => {
  try {
    const options: mongoose.ConnectOptions = {
      writeConcern: { w: 'majority' },
      maxPoolSize: 100,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flash-sale-system', options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    return conn.connection;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error connecting to MongoDB: ${error.message}`);
    } else {
      logger.error('Unknown error connecting to MongoDB');
    }
    process.exit(1);
  }
};

export default connectDB;