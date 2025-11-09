"use strict";
/**
 * Utility functions shared across 402pay packages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPublicKey = isValidPublicKey;
exports.toTokenAmount = toTokenAmount;
exports.fromTokenAmount = fromTokenAmount;
exports.generateNonce = generateNonce;
exports.isExpired = isExpired;
exports.formatCurrency = formatCurrency;
exports.sleep = sleep;
exports.retry = retry;
exports.truncate = truncate;
const web3_js_1 = require("@solana/web3.js");
const index_1 = require("./index");
/**
 * Validate Solana public key
 */
function isValidPublicKey(key) {
    try {
        new web3_js_1.PublicKey(key);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Convert token amount to lamports/smallest unit
 */
function toTokenAmount(amount, currency) {
    const decimals = index_1.TOKEN_DECIMALS[currency];
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}
/**
 * Convert lamports/smallest unit to token amount
 */
function fromTokenAmount(amount, currency) {
    const decimals = index_1.TOKEN_DECIMALS[currency];
    return Number(amount) / Math.pow(10, decimals);
}
/**
 * Generate a random nonce for payment requirements
 */
function generateNonce() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}
/**
 * Check if a timestamp is expired
 */
function isExpired(timestamp) {
    return Date.now() > timestamp;
}
/**
 * Format currency amount for display
 */
function formatCurrency(amount, currency) {
    return `${amount.toFixed(index_1.TOKEN_DECIMALS[currency])} ${currency}`;
}
/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Retry a function with exponential backoff
 */
async function retry(fn, options = {}) {
    const { maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2 } = options;
    let lastError;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxAttempts - 1) {
                await sleep(delayMs * Math.pow(backoffMultiplier, attempt));
            }
        }
    }
    throw lastError || new Error('Retry failed');
}
/**
 * Truncate a string (useful for displaying addresses)
 */
function truncate(str, startChars = 4, endChars = 4) {
    if (str.length <= startChars + endChars) {
        return str;
    }
    return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}
//# sourceMappingURL=utils.js.map