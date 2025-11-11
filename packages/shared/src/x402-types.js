"use strict";
/**
 * x402 Protocol Types - Official Specification Compliance
 * Based on: https://github.com/coinbase/x402
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402ErrorCodeLegacy = exports.X402SupportedNetwork = exports.X402PaymentSchemeLegacy = exports.X402_STATUS = exports.X402_HEADERS = exports.X402_VERSION = void 0;
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
 * x402 Payment Schemes (LEGACY - use X402PaymentScheme from x402-spec-types instead)
 * @deprecated
 */
var X402PaymentSchemeLegacy;
(function (X402PaymentSchemeLegacy) {
    X402PaymentSchemeLegacy["EXACT"] = "exact";
    X402PaymentSchemeLegacy["UPTO"] = "upto";
})(X402PaymentSchemeLegacy || (exports.X402PaymentSchemeLegacy = X402PaymentSchemeLegacy = {}));
/**
 * x402 Supported Networks (LEGACY - use X402Network from x402-spec-types instead)
 * @deprecated
 */
var X402SupportedNetwork;
(function (X402SupportedNetwork) {
    X402SupportedNetwork["SOLANA"] = "solana";
    X402SupportedNetwork["SOLANA_DEVNET"] = "solana-devnet";
    X402SupportedNetwork["SOLANA_TESTNET"] = "solana-testnet";
})(X402SupportedNetwork || (exports.X402SupportedNetwork = X402SupportedNetwork = {}));
/**
 * Error Codes (LEGACY - use X402ErrorCode from x402-spec-types instead)
 * @deprecated
 */
var X402ErrorCodeLegacy;
(function (X402ErrorCodeLegacy) {
    X402ErrorCodeLegacy["INVALID_PAYMENT"] = "INVALID_PAYMENT";
    X402ErrorCodeLegacy["INSUFFICIENT_AMOUNT"] = "INSUFFICIENT_AMOUNT";
    X402ErrorCodeLegacy["EXPIRED_PAYMENT"] = "EXPIRED_PAYMENT";
    X402ErrorCodeLegacy["INVALID_SIGNATURE"] = "INVALID_SIGNATURE";
    X402ErrorCodeLegacy["INVALID_NETWORK"] = "INVALID_NETWORK";
    X402ErrorCodeLegacy["SETTLEMENT_FAILED"] = "SETTLEMENT_FAILED";
    X402ErrorCodeLegacy["ALREADY_SETTLED"] = "ALREADY_SETTLED";
})(X402ErrorCodeLegacy || (exports.X402ErrorCodeLegacy = X402ErrorCodeLegacy = {}));
//# sourceMappingURL=x402-types.js.map