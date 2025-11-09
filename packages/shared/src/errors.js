"use strict";
/**
 * Custom error classes for 402pay
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionInactiveError = exports.SubscriptionNotFoundError = exports.AgentNotFoundError = exports.InvalidApiKeyError = exports.RateLimitExceededError = exports.AmountMismatchError = exports.ReplayAttackError = exports.TransactionFailedError = exports.InvalidSignatureError = exports.InsufficientAmountError = exports.InvalidPaymentError = exports.PaymentExpiredError = exports.PaymentError = void 0;
const constants_1 = require("./constants");
/**
 * Base error class for all 402pay errors
 */
class PaymentError extends Error {
    code;
    statusCode;
    details;
    constructor(message, code, statusCode = constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, details) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
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
exports.PaymentError = PaymentError;
/**
 * Payment expired error
 */
class PaymentExpiredError extends PaymentError {
    constructor(message = 'Payment proof has expired') {
        super(message, constants_1.ERROR_CODES.PAYMENT_EXPIRED, constants_1.HTTP_STATUS.PAYMENT_REQUIRED);
    }
}
exports.PaymentExpiredError = PaymentExpiredError;
/**
 * Invalid payment error
 */
class InvalidPaymentError extends PaymentError {
    constructor(message = 'Invalid payment proof', details) {
        super(message, constants_1.ERROR_CODES.INVALID_PAYMENT, constants_1.HTTP_STATUS.PAYMENT_REQUIRED, details);
    }
}
exports.InvalidPaymentError = InvalidPaymentError;
/**
 * Insufficient amount error
 */
class InsufficientAmountError extends PaymentError {
    constructor(expected, received) {
        super(`Insufficient payment amount: expected ${expected}, received ${received}`, constants_1.ERROR_CODES.INSUFFICIENT_AMOUNT, constants_1.HTTP_STATUS.PAYMENT_REQUIRED, { expected, received });
    }
}
exports.InsufficientAmountError = InsufficientAmountError;
/**
 * Invalid signature error
 */
class InvalidSignatureError extends PaymentError {
    constructor(message = 'Invalid cryptographic signature') {
        super(message, constants_1.ERROR_CODES.INVALID_SIGNATURE, constants_1.HTTP_STATUS.PAYMENT_REQUIRED);
    }
}
exports.InvalidSignatureError = InvalidSignatureError;
/**
 * Transaction failed error
 */
class TransactionFailedError extends PaymentError {
    constructor(message = 'Transaction verification failed', details) {
        super(message, constants_1.ERROR_CODES.TRANSACTION_FAILED, constants_1.HTTP_STATUS.PAYMENT_REQUIRED, details);
    }
}
exports.TransactionFailedError = TransactionFailedError;
/**
 * Replay attack error
 */
class ReplayAttackError extends PaymentError {
    constructor(message = 'Nonce has already been used') {
        super(message, constants_1.ERROR_CODES.REPLAY_ATTACK, constants_1.HTTP_STATUS.PAYMENT_REQUIRED);
    }
}
exports.ReplayAttackError = ReplayAttackError;
/**
 * Amount mismatch error
 */
class AmountMismatchError extends PaymentError {
    constructor(expected, actual) {
        super(`Transaction amount mismatch: expected ${expected}, got ${actual}`, constants_1.ERROR_CODES.AMOUNT_MISMATCH, constants_1.HTTP_STATUS.PAYMENT_REQUIRED, { expected, actual });
    }
}
exports.AmountMismatchError = AmountMismatchError;
/**
 * Rate limit exceeded error
 */
class RateLimitExceededError extends PaymentError {
    constructor(message = 'Rate limit exceeded') {
        super(message, constants_1.ERROR_CODES.RATE_LIMIT_EXCEEDED, constants_1.HTTP_STATUS.TOO_MANY_REQUESTS);
    }
}
exports.RateLimitExceededError = RateLimitExceededError;
/**
 * Invalid API key error
 */
class InvalidApiKeyError extends PaymentError {
    constructor(message = 'Invalid or missing API key') {
        super(message, constants_1.ERROR_CODES.INVALID_API_KEY, constants_1.HTTP_STATUS.UNAUTHORIZED);
    }
}
exports.InvalidApiKeyError = InvalidApiKeyError;
/**
 * Agent not found error
 */
class AgentNotFoundError extends PaymentError {
    constructor(agentId) {
        super(`Agent not found: ${agentId}`, constants_1.ERROR_CODES.AGENT_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND, { agentId });
    }
}
exports.AgentNotFoundError = AgentNotFoundError;
/**
 * Subscription not found error
 */
class SubscriptionNotFoundError extends PaymentError {
    constructor(subscriptionId) {
        super(`Subscription not found: ${subscriptionId}`, constants_1.ERROR_CODES.SUBSCRIPTION_NOT_FOUND, constants_1.HTTP_STATUS.NOT_FOUND, { subscriptionId });
    }
}
exports.SubscriptionNotFoundError = SubscriptionNotFoundError;
/**
 * Subscription inactive error
 */
class SubscriptionInactiveError extends PaymentError {
    constructor(subscriptionId, status) {
        super(`Subscription is inactive: ${subscriptionId}`, constants_1.ERROR_CODES.SUBSCRIPTION_INACTIVE, constants_1.HTTP_STATUS.PAYMENT_REQUIRED, { subscriptionId, status });
    }
}
exports.SubscriptionInactiveError = SubscriptionInactiveError;
//# sourceMappingURL=errors.js.map