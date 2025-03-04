import { UserDocument } from '../models/user.model';

// user property to Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

// Error response interface
export interface ErrorResponse {
  success: boolean;
  error: string;
}

// Success response interface
export interface SuccessResponse<T> {
  success: boolean;
  count?: number;
  data: T;
}

// Leaderboard Entry interface
export interface LeaderboardEntry {
  position: number;
  user: string;
  purchaseTime: Date;
  quantity: number;
}

// Auth JWT decoded payload interface
export interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// Environment variables interface
export interface EnvVariables {
  NODE_ENV: string;
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRE: string;
  LOG_LEVEL: string;
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  PURCHASE_RATE_LIMIT_WINDOW: number;
  PURCHASE_RATE_LIMIT_MAX: number;
}