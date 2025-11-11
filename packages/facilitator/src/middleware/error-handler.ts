/**
 * Global error handler middleware
 */

import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, PaymentError } from '@402pay/shared';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = (req as any).requestId;

  // Log the error with context
  logger.error('Error occurred', {
    requestId,
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ...(err instanceof PaymentError && { code: err.code, statusCode: err.statusCode }),
  });

  // Handle custom PaymentError instances
  if (err instanceof PaymentError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.details && { details: err.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Handle generic errors
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: err.message || 'Internal server error',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
