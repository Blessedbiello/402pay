/**
 * SDK Error Classes
 * Comprehensive error handling for 402pay SDK
 */

export enum ErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_REFUSED = 'CONNECTION_REFUSED',

  // Payment errors
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_EXPIRED = 'PAYMENT_EXPIRED',
  PAYMENT_VERIFICATION_FAILED = 'PAYMENT_VERIFICATION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  AMOUNT_MISMATCH = 'AMOUNT_MISMATCH',

  // Transaction errors
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_NOT_FOUND = 'TRANSACTION_NOT_FOUND',
  TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',

  // Auth errors
  INVALID_API_KEY = 'INVALID_API_KEY',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Validation errors
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  INVALID_PROOF = 'INVALID_PROOF',
  INVALID_PARAMETERS = 'INVALID_PARAMETERS',

  // Replay protection
  REPLAY_ATTACK = 'REPLAY_ATTACK',
  NONCE_REUSED = 'NONCE_REUSED',

  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

/**
 * Base error class for all SDK errors
 */
export class SolPay402Error extends Error {
  constructor(
    message: string,
    public code: ErrorCode,
    public statusCode?: number,
    public details?: any,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'SolPay402Error';
    Object.setPrototypeOf(this, SolPay402Error.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      retryable: this.retryable,
    };
  }
}

/**
 * Network-related errors (retryable)
 */
export class NetworkError extends SolPay402Error {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.NETWORK_ERROR, 0, details, true);
    this.name = 'NetworkError';
  }
}

/**
 * Payment verification failed
 */
export class PaymentVerificationError extends SolPay402Error {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.PAYMENT_VERIFICATION_FAILED,
    statusCode?: number,
    details?: any
  ) {
    super(message, code, statusCode, details, false);
    this.name = 'PaymentVerificationError';
  }
}

/**
 * Transaction failed on blockchain
 */
export class TransactionError extends SolPay402Error {
  constructor(
    message: string,
    details?: any,
    retryable: boolean = false
  ) {
    super(message, ErrorCode.TRANSACTION_FAILED, undefined, details, retryable);
    this.name = 'TransactionError';
  }
}

/**
 * Authentication failed
 */
export class AuthenticationError extends SolPay402Error {
  constructor(message: string, details?: any) {
    super(message, ErrorCode.UNAUTHORIZED, 401, details, false);
    this.name = 'AuthenticationError';
  }
}

/**
 * Rate limit exceeded
 */
export class RateLimitError extends SolPay402Error {
  constructor(message: string, retryAfter?: number) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, 429, { retryAfter }, true);
    this.name = 'RateLimitError';
  }
}

/**
 * Parse API error response and create appropriate error
 */
export function parseApiError(
  response: Response,
  body?: any
): SolPay402Error {
  const statusCode = response.status;
  const message = body?.error || body?.message || response.statusText;
  const code = body?.code as ErrorCode || ErrorCode.UNKNOWN_ERROR;
  const details = body?.details;

  // Determine if error is retryable
  const retryable = statusCode >= 500 || statusCode === 429 || statusCode === 408;

  switch (statusCode) {
    case 401:
    case 403:
      return new AuthenticationError(message, details);
    case 429:
      return new RateLimitError(message, body?.retryAfter);
    case 402:
      return new PaymentVerificationError(message, code, statusCode, details);
    default:
      return new SolPay402Error(message, code, statusCode, details, retryable);
  }
}
