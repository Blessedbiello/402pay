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
import { KoraClientConfig, KoraSignTransactionResponse, KoraSignAndSendTransactionRequest, KoraSignAndSendTransactionResponse, KoraGetPayerSignerResponse, KoraHealthResponse } from './kora-types';
export declare class KoraClient {
    private rpcUrl;
    private apiKey;
    private timeout;
    private requestId;
    constructor(rpcUrl?: string, apiKey?: string, config?: Partial<KoraClientConfig>);
    /**
     * Validate transaction without signing or sending
     *
     * Use this in the /verify endpoint to check if a transaction is valid
     * before actually submitting it to the network.
     *
     * @param transaction - Base64-encoded unsigned transaction
     * @returns Validation result
     */
    validateTransaction(transaction: string): Promise<KoraSignTransactionResponse>;
    /**
     * Sign transaction without sending
     *
     * Returns the signed transaction for inspection or later broadcast.
     *
     * @param transaction - Base64-encoded unsigned transaction
     * @returns Signed transaction
     */
    signTransaction(transaction: string): Promise<KoraSignTransactionResponse>;
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
    signAndSendTransaction(transaction: string, options?: KoraSignAndSendTransactionRequest['options']): Promise<KoraSignAndSendTransactionResponse>;
    /**
     * Get Kora's fee payer address
     *
     * Use this in the /supported endpoint to advertise who pays gas fees.
     *
     * @returns Kora's public key address
     */
    getPayerSigner(): Promise<KoraGetPayerSignerResponse>;
    /**
     * Health check
     *
     * @returns Health status
     */
    health(): Promise<KoraHealthResponse>;
    /**
     * Generic JSON-RPC call to Kora
     */
    private rpcCall;
    /**
     * Build HTTP headers for requests
     */
    private buildHeaders;
}
/**
 * Custom error class for Kora RPC errors
 */
export declare class KoraRPCError extends Error {
    code: number;
    data?: any | undefined;
    constructor(message: string, code: number, data?: any | undefined);
}
/**
 * Helper to create a Kora client from environment variables
 */
export declare function createKoraClientFromEnv(): KoraClient;
//# sourceMappingURL=kora-client.d.ts.map