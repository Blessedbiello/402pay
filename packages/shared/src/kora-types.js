"use strict";
/**
 * Kora RPC API Types
 *
 * Based on official Kora RPC specification:
 * https://github.com/solana-foundation/kora
 *
 * Kora is a gasless transaction signing service for Solana.
 * It allows users to pay in USDC or other tokens without needing SOL for gas.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isKoraError = isKoraError;
exports.isKoraSignSuccess = isKoraSignSuccess;
exports.isKoraSendSuccess = isKoraSendSuccess;
// ============================================================================
// Type Guards
// ============================================================================
/**
 * Check if response is a Kora error
 */
function isKoraError(response) {
    return 'error' in response && response.error !== undefined;
}
/**
 * Check if sign transaction response indicates success
 */
function isKoraSignSuccess(response) {
    return response.success === true && !!response.signed_transaction;
}
/**
 * Check if sign and send response indicates success
 */
function isKoraSendSuccess(response) {
    return response.success === true && !!response.signature;
}
//# sourceMappingURL=kora-types.js.map