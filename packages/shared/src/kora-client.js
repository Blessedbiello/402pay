"use strict";
/**
 * Kora RPC Client
 *
 * TypeScript client for interacting with Kora gasless signing service.
 *
 * Usage:
 * ```typescript
 * const kora = new KoraClient('http://localhost:8080', 'your-api-key');
 *
 * // Validate transaction
 * const validation = await kora.validateTransaction(unsignedTx);
 *
 * // Sign and send transaction (gasless for user!)
 * const result = await kora.signAndSendTransaction(unsignedTx);
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoraRPCError = exports.KoraClient = void 0;
exports.createKoraClientFromEnv = createKoraClientFromEnv;
const kora_types_1 = require("./kora-types");
class KoraClient {
    rpcUrl;
    apiKey;
    timeout;
    requestId;
    constructor(rpcUrl = 'http://localhost:8080', apiKey = '', config) {
        this.rpcUrl = rpcUrl;
        this.apiKey = apiKey;
        this.timeout = config?.timeout || 30000;
        this.requestId = 1;
    }
    /**
     * Validate transaction without signing or sending
     *
     * Use this in the /verify endpoint to check if a transaction is valid
     * before actually submitting it to the network.
     *
     * @param transaction - Base64-encoded unsigned transaction
     * @returns Validation result
     */
    async validateTransaction(transaction) {
        const request = {
            transaction,
            validate_only: true,
        };
        const response = await this.rpcCall('signTransaction', request);
        return response;
    }
    /**
     * Sign transaction without sending
     *
     * Returns the signed transaction for inspection or later broadcast.
     *
     * @param transaction - Base64-encoded unsigned transaction
     * @returns Signed transaction
     */
    async signTransaction(transaction) {
        const request = {
            transaction,
            validate_only: false,
        };
        return this.rpcCall('signTransaction', request);
    }
    /**
     * Sign and send transaction to Solana (gasless!)
     *
     * Use this in the /settle endpoint to execute the payment.
     * Kora will sign as the fee payer and submit to Solana.
     *
     * @param transaction - Base64-encoded unsigned transaction
     * @param options - Transaction options
     * @returns Transaction signature
     */
    async signAndSendTransaction(transaction, options) {
        const request = {
            transaction,
            options,
        };
        return this.rpcCall('signAndSendTransaction', request);
    }
    /**
     * Get Kora's fee payer address
     *
     * Use this in the /supported endpoint to advertise who pays gas fees.
     *
     * @returns Kora's public key address
     */
    async getPayerSigner() {
        return this.rpcCall('getPayerSigner', {});
    }
    /**
     * Health check
     *
     * @returns Health status
     */
    async health() {
        try {
            const response = await fetch(`${this.rpcUrl}/health`, {
                method: 'GET',
                headers: this.buildHeaders(),
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                return { status: 'error' };
            }
            return (await response.json());
        }
        catch (error) {
            return { status: 'error' };
        }
    }
    /**
     * Generic JSON-RPC call to Kora
     */
    async rpcCall(method, params) {
        const requestBody = {
            jsonrpc: '2.0',
            id: this.requestId++,
            method,
            params,
        };
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(this.rpcUrl, {
                method: 'POST',
                headers: this.buildHeaders(),
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`Kora RPC HTTP error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if ((0, kora_types_1.isKoraError)(data)) {
                throw new KoraRPCError(data.error.message, data.error.code, data.error.data);
            }
            if (!data.result) {
                throw new Error('Kora RPC response missing result field');
            }
            return data.result;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof KoraRPCError) {
                throw error;
            }
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw new Error(`Kora RPC timeout after ${this.timeout}ms`);
                }
                throw new Error(`Kora RPC error: ${error.message}`);
            }
            throw new Error('Unknown Kora RPC error');
        }
    }
    /**
     * Build HTTP headers for requests
     */
    buildHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.apiKey) {
            headers['X-API-Key'] = this.apiKey;
        }
        return headers;
    }
}
exports.KoraClient = KoraClient;
/**
 * Custom error class for Kora RPC errors
 */
class KoraRPCError extends Error {
    code;
    data;
    constructor(message, code, data) {
        super(message);
        this.code = code;
        this.data = data;
        this.name = 'KoraRPCError';
    }
}
exports.KoraRPCError = KoraRPCError;
/**
 * Helper to create a Kora client from environment variables
 */
function createKoraClientFromEnv() {
    const rpcUrl = process.env.KORA_RPC_URL || 'http://localhost:8080';
    const apiKey = process.env.KORA_API_KEY || '';
    if (!apiKey && process.env.NODE_ENV === 'production') {
        console.warn('⚠️  KORA_API_KEY not set. Kora RPC may reject requests.');
    }
    return new KoraClient(rpcUrl, apiKey);
}
//# sourceMappingURL=kora-client.js.map