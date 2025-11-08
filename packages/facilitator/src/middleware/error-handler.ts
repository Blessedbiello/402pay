/**
 * Global error handler middleware
 */

import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '@402pay/shared';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
