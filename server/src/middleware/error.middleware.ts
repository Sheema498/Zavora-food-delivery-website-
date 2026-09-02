import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Resource not found at route: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'An unexpected internal server error occurred';

  if (process.env.NODE_ENV === 'development') {
    console.error(' [ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
