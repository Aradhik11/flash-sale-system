import { Response } from 'express';
import { ErrorResponse } from '../types/express';

/**
 * Error response handler
 * @param {Response} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {Response} - JSON response with error message
 */
const errorHandler = (res: Response, statusCode: number, message: string): Response<ErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    error: message
  });
};

export default errorHandler;