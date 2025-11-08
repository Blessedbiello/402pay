/**
 * Custom error classes for 402pay
 */

import { ERROR_CODES, HTTP_STATUS } from './constants';

/**
 * Base error class for all 402pay errors
 */
export class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Payment expired error
 */
export class PaymentExpiredError extends PaymentError {
  constructor(message = 'Payment proof has expired') {
    super(message, ERROR_CODES.PAYMENT_EXPIRED, HTTP_STATUS.PAYMENT_REQUIRED);
  }
}

/**
 * Invalid payment error
 */
export class InvalidPaymentError extends PaymentError {
  constructor(message = 'Invalid payment proof', details?: any) {
    super(message, ERROR_CODES.INVALID_PAYMENT, HTTP_STATUS.PAYMENT_REQUIRED, details);
  }
}

/**
 * Insufficient amount error
 */
export class InsufficientAmountError extends PaymentError {
  constructor(expected: number, received: number) {
    super(
      `Insufficient payment amount: expected ${expected}, received ${received}`,
      ERROR_CODES.INSUFFICIENT_AMOUNT,
      HTTP_STATUS.PAYMENT_REQUIRED,
      { expected, received }
    );
  }
}

/**
 * Invalid signature error
 */
export class InvalidSignatureError extends PaymentError {
  constructor(message = 'Invalid cryptographic signature') {
    super(message, ERROR_CODES.INVALID_SIGNATURE, HTTP_STATUS.PAYMENT_REQUIRED);
  }
}

/**
 * Transaction failed error
 */
export class TransactionFailedError extends PaymentError {
  constructor(message = 'Transaction verification failed', details?: any) {
    super(message, ERROR_CODES.TRANSACTION_FAILED, HTTP_STATUS.PAYMENT_REQUIRED, details);
  }
}

/**
 * Replay attack error
 */
export class ReplayAttackError extends PaymentError {
  constructor(message = 'Nonce has already been used') {
    super(message, ERROR_CODES.REPLAY_ATTACK, HTTP_STATUS.PAYMENT_REQUIRED);
  }
}

/**
 * Amount mismatch error
 */
export class AmountMismatchError extends PaymentError {
  constructor(expected: number, actual: number) {
    super(
      `Transaction amount mismatch: expected ${expected}, got ${actual}`,
      ERROR_CODES.AMOUNT_MISMATCH,
      HTTP_STATUS.PAYMENT_REQUIRED,
      { expected, actual }
    );
  }
}

/**
 * Rate limit exceeded error
 */
export class RateLimitExceededError extends PaymentError {
  constructor(message = 'Rate limit exceeded') {
    super(message, ERROR_CODES.RATE_LIMIT_EXCEEDED, HTTP_STATUS.TOO_MANY_REQUESTS);
  }
}

/**
 * Invalid API key error
 */
export class InvalidApiKeyError extends PaymentError {
  constructor(message = 'Invalid or missing API key') {
    super(message, ERROR_CODES.INVALID_API_KEY, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Agent not found error
 */
export class AgentNotFoundError extends PaymentError {
  constructor(agentId: string) {
    super(
      `Agent not found: ${agentId}`,
      ERROR_CODES.AGENT_NOT_FOUND,
      HTTP_STATUS.NOT_FOUND,
      { agentId }
    );
  }
}

/**
 * Subscription not found error
 */
export class SubscriptionNotFoundError extends PaymentError {
  constructor(subscriptionId: string) {
    super(
      `Subscription not found: ${subscriptionId}`,
      ERROR_CODES.SUBSCRIPTION_NOT_FOUND,
      HTTP_STATUS.NOT_FOUND,
      { subscriptionId }
    );
  }
}

/**
 * Subscription inactive error
 */
export class SubscriptionInactiveError extends PaymentError {
  constructor(subscriptionId: string, status: string) {
    super(
      `Subscription is inactive: ${subscriptionId}`,
      ERROR_CODES.SUBSCRIPTION_INACTIVE,
      HTTP_STATUS.PAYMENT_REQUIRED,
      { subscriptionId, status }
    );
  }
}
