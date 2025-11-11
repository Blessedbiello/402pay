"use strict";
/**
 * x402 Protocol Types - Official Specification Compliance
 * Based on: https://github.com/coinbase/x402
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402ErrorCode = exports.SupportedNetwork = exports.PaymentScheme = exports.X402_STATUS = exports.X402_HEADERS = exports.X402_VERSION = void 0;
/**
 * x402 Protocol Version
 */
exports.X402_VERSION = '0.1.0';
/**
 * x402 Header Names
 */
exports.X402_HEADERS = {
    PAYMENT: 'X-PAYMENT',
    PAYMENT_RESPONSE: 'X-PAYMENT-RESPONSE',
};
/**
 * x402 HTTP Status Codes
 */
exports.X402_STATUS = {
    PAYMENT_REQUIRED: 402,
    OK: 200,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    BAD_REQUEST: 400,
};
/**
 * Payment Schemes
 */
var PaymentScheme;
(function (PaymentScheme) {
    PaymentScheme["EXACT"] = "exact";
    PaymentScheme["UPTO"] = "upto";
})(PaymentScheme || (exports.PaymentScheme = PaymentScheme = {}));
/**
 * Supported Networks
 */
var SupportedNetwork;
(function (SupportedNetwork) {
    SupportedNetwork["SOLANA"] = "solana";
    SupportedNetwork["SOLANA_DEVNET"] = "solana-devnet";
    SupportedNetwork["SOLANA_TESTNET"] = "solana-testnet";
})(SupportedNetwork || (exports.SupportedNetwork = SupportedNetwork = {}));
/**
 * Error Codes
 */
var X402ErrorCode;
(function (X402ErrorCode) {
    X402ErrorCode["INVALID_PAYMENT"] = "INVALID_PAYMENT";
    X402ErrorCode["INSUFFICIENT_AMOUNT"] = "INSUFFICIENT_AMOUNT";
    X402ErrorCode["EXPIRED_PAYMENT"] = "EXPIRED_PAYMENT";
    X402ErrorCode["INVALID_SIGNATURE"] = "INVALID_SIGNATURE";
    X402ErrorCode["INVALID_NETWORK"] = "INVALID_NETWORK";
    X402ErrorCode["SETTLEMENT_FAILED"] = "SETTLEMENT_FAILED";
    X402ErrorCode["ALREADY_SETTLED"] = "ALREADY_SETTLED";
})(X402ErrorCode || (exports.X402ErrorCode = X402ErrorCode = {}));
//# sourceMappingURL=x402-types.js.map