/**
 * Custom error classes for 402pay
 */
/**
 * Base error class for all 402pay errors
 */
export declare class PaymentError extends Error {
    code: string;
    statusCode: number;
    details?: any | undefined;
    constructor(message: string, code: string, statusCode?: number, details?: any | undefined);
    toJSON(): {
        error: string;
        code: string;
        statusCode: number;
        details: any;
    };
}
/**
 * Payment expired error
 */
export declare class PaymentExpiredError extends PaymentError {
    constructor(message?: string);
}
/**
 * Invalid payment error
 */
export declare class InvalidPaymentError extends PaymentError {
    constructor(message?: string, details?: any);
}
/**
 * Insufficient amount error
 */
export declare class InsufficientAmountError extends PaymentError {
    constructor(expected: number, received: number);
}
/**
 * Invalid signature error
 */
export declare class InvalidSignatureError extends PaymentError {
    constructor(message?: string);
}
/**
 * Transaction failed error
 */
export declare class TransactionFailedError extends PaymentError {
    constructor(message?: string, details?: any);
}
/**
 * Replay attack error
 */
export declare class ReplayAttackError extends PaymentError {
    constructor(message?: string);
}
/**
 * Amount mismatch error
 */
export declare class AmountMismatchError extends PaymentError {
    constructor(expected: number, actual: number);
}
/**
 * Rate limit exceeded error
 */
export declare class RateLimitExceededError extends PaymentError {
    constructor(message?: string);
}
/**
 * Invalid API key error
 */
export declare class InvalidApiKeyError extends PaymentError {
    constructor(message?: string);
}
/**
 * Agent not found error
 */
export declare class AgentNotFoundError extends PaymentError {
    constructor(agentId: string);
}
/**
 * Subscription not found error
 */
export declare class SubscriptionNotFoundError extends PaymentError {
    constructor(subscriptionId: string);
}
/**
 * Subscription inactive error
 */
export declare class SubscriptionInactiveError extends PaymentError {
    constructor(subscriptionId: string, status: string);
}
//# sourceMappingURL=errors.d.ts.map