"use strict";
/**
 * x402 Protocol Types - Official Coinbase Specification
 * Based on: https://github.com/coinbase/x402
 *
 * These types match the official x402 specification exactly.
 * All field names and structures are spec-compliant.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402ErrorCode = exports.X402Network = exports.X402PaymentScheme = exports.X402_HTTP_HEADERS = exports.X402_HTTP_STATUS = exports.X402_SPEC_VERSION = void 0;
exports.isSolanaPaymentData = isSolanaPaymentData;
exports.isEVMPaymentData = isEVMPaymentData;
/**
 * x402 Protocol Version
 */
exports.X402_SPEC_VERSION = 1;
/**
 * HTTP Status Codes
 */
exports.X402_HTTP_STATUS = {
    PAYMENT_REQUIRED: 402,
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
};
/**
 * HTTP Headers
 */
exports.X402_HTTP_HEADERS = {
    PAYMENT: 'X-PAYMENT',
    PAYMENT_RESPONSE: 'X-PAYMENT-RESPONSE',
};
/**
 * Payment Schemes
 */
var X402PaymentScheme;
(function (X402PaymentScheme) {
    X402PaymentScheme["EXACT"] = "exact";
    // Future: SUBSCRIPTION = 'subscription',
    // Future: METERED = 'metered',
})(X402PaymentScheme || (exports.X402PaymentScheme = X402PaymentScheme = {}));
/**
 * Supported Networks
 */
var X402Network;
(function (X402Network) {
    X402Network["SOLANA"] = "solana";
    X402Network["SOLANA_DEVNET"] = "solana-devnet";
    X402Network["SOLANA_TESTNET"] = "solana-testnet";
    X402Network["BASE"] = "base";
    X402Network["BASE_SEPOLIA"] = "base-sepolia";
})(X402Network || (exports.X402Network = X402Network = {}));
// ============================================================================
// Error Codes
// ============================================================================
/**
 * x402 Error Codes
 */
var X402ErrorCode;
(function (X402ErrorCode) {
    X402ErrorCode["INVALID_PAYMENT"] = "INVALID_PAYMENT";
    X402ErrorCode["INSUFFICIENT_AMOUNT"] = "INSUFFICIENT_AMOUNT";
    X402ErrorCode["EXPIRED_PAYMENT"] = "EXPIRED_PAYMENT";
    X402ErrorCode["INVALID_SIGNATURE"] = "INVALID_SIGNATURE";
    X402ErrorCode["INVALID_NETWORK"] = "INVALID_NETWORK";
    X402ErrorCode["INVALID_SCHEME"] = "INVALID_SCHEME";
    X402ErrorCode["SETTLEMENT_FAILED"] = "SETTLEMENT_FAILED";
    X402ErrorCode["ALREADY_SETTLED"] = "ALREADY_SETTLED";
    X402ErrorCode["FACILITATOR_ERROR"] = "FACILITATOR_ERROR";
})(X402ErrorCode || (exports.X402ErrorCode = X402ErrorCode = {}));
/**
 * Type guard to check if payload is Solana payment data
 * Supports both direct RPC flow (with signature) and Kora gasless flow (with unsigned_transaction)
 */
function isSolanaPaymentData(payload) {
    return (typeof payload === 'object' &&
        payload !== null &&
        ('signature' in payload || 'unsigned_transaction' in payload) &&
        'from' in payload &&
        'to' in payload &&
        'amount' in payload &&
        'timestamp' in payload);
}
/**
 * Type guard to check if payload is EVM payment data
 */
function isEVMPaymentData(payload) {
    return (typeof payload === 'object' &&
        payload !== null &&
        'signature' in payload &&
        'authorization' in payload &&
        typeof payload.authorization === 'object');
}
//# sourceMappingURL=x402-spec-types.js.map