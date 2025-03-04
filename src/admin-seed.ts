import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/user.model';
import bcrypt from 'bcryptjs';
import logger from './utils/logger';

// Load environment variables
dotenv.config();

const createAdminUser = async (): Promise<void> => {
  try {
    // To connect to the database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flash-sale-system');
    logger.info('MongoDB Connected for admin seeding');
    
    // To check if admin exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminExists = await User.findOne({ email: adminEmail });
    
    if (adminExists) {
      logger.info('Admin user already exists');
      process.exit(0);
    }
    
    // Hashing the admin password
    const password = process.env.ADMIN_PASSWORD || 'admin123456'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      password, 
      salt
    );
    
    // Creating admin user
    const admin = await User.collection.insertOne({
      name: process.env.ADMIN_NAME || 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const adminId = admin.insertedId;
    
    logger.info(`Admin user created successfully with ID: ${adminId}`);
    process.exit(0);
  } catch (error) {
    logger.error(`Error creating admin user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
};

// Calling the function
createAdminUser();