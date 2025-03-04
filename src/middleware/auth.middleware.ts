import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../models/user.model';
import errorHandler from '../utils/error-handler';
import { JwtPayload } from '../types/express';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  // Checking for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Setting token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Setting token from cookie if available
    token = req.cookies.token;
  }

  // Checking if token exists
  if (!token) {
    errorHandler(res, 401, 'Not authorized to access this route');
    return;
  }

  try {
    // Verifying token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

    // Adding user to req
    const user = await User.findById(decoded.id);
    
    if (!user) {
      errorHandler(res, 401, 'User not found');
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    errorHandler(res, 401, 'Not authorized to access this route');
    return;
  }
};

export const restrictToAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    errorHandler(res, 401, 'Not authorized to access this route');
    return;
  }
  
  if (!(req.user as any).isAdmin) {
     errorHandler(res, 403, 'Admin access required for this route');
     return;
  }
  
  next();
};