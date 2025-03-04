import { Request, Response } from 'express';
import User from '../models/user.model';
import errorHandler from '../utils/error-handler';
import logger from '../utils/logger';
import { SuccessResponse } from '../types/express';
import FlashSale from '../models/flash-sale.model';
import Purchase from '../models/purchase.model';


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validating password length
    if (password && password.length < 6) {
      errorHandler(res, 400, 'Password must be at least 6 characters');
      return;
    }

    // Checking if the email is already in use
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      errorHandler(res, 400, 'Email already in use');
      return;
    }

    // Creating user
    const user = await User.create({
      name,
      email,
      password
    });

    // Getting a token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token
    });
  } catch (error) {
    logger.error(`Error registering user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validating email & password
    if (!email || !password) {
      errorHandler(res, 400, 'Please provide an email and password');
      return
    }

    // Checking for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      errorHandler(res, 401, 'Invalid email');
      return;
    }

    // Checking if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      errorHandler(res, 401, 'Invalid password');
      return;
    }

    // Getting a token
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    logger.error(`Error logging in user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorHandler(res, 401, 'Not authorized to access this route');
      return
    }
    
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    } as SuccessResponse<typeof user>);
  } catch (error) {
    logger.error(`Error getting user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
    return;
  }
};

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.isAdmin) {
      errorHandler(res, 403, 'Admin access required');
      return;
    }

    const userCount = await User.countDocuments();
    const flashSaleCount = await FlashSale.countDocuments();
    const purchaseCount = await Purchase.countDocuments();
    
    // Getting active flash sales
    const activeFlashSales = await FlashSale.find({ status: 'active' });
    
    res.status(200).json({
      success: true,
      data: {
        userCount,
        flashSaleCount,
        purchaseCount,
        activeFlashSales: activeFlashSales.length,
        adminEmail: req.user.email
      }
    });
  } catch (error) {
    logger.error(`Error getting admin stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    errorHandler(res, 500, error instanceof Error ? error.message : 'Server Error');
  }
};