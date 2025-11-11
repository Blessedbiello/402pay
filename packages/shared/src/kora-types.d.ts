/**
 * Kora RPC API Types
 *
 * Based on official Kora RPC specification:
 * https://github.com/solana-foundation/kora
 *
 * Kora is a gasless transaction signing service for Solana.
 * It allows users to pay in USDC or other tokens without needing SOL for gas.
 */
/**
 * Request to sign a transaction (with optional validation-only mode)
 */
export interface KoraSignTransactionRequest {
    /** Base64-encoded serialized transaction */
    transaction: string;
    /** If true, validate without actually signing */
    validate_only?: boolean;
}
/**
 * Request to sign and broadcast a transaction to Solana
 */
export interface KoraSignAndSendTransactionRequest {
    /** Base64-encoded serialized transaction */
    transaction: string;
    /** Transaction options */
    options?: {
        /** Skip preflight checks */
        skip_preflight?: boolean;
        /** Preflight commitment level */
        preflight_commitment?: 'processed' | 'confirmed' | 'finalized';
        /** Maximum retries */
        max_retries?: number;
    };
}
/**
 * Request to get Kora's fee payer address
 */
export interface KoraGetPayerSignerRequest {
}
/**
 * Response from signTransaction endpoint
 */
export interface KoraSignTransactionResponse {
    /** Whether the operation succeeded */
    success: boolean;
    /** Base64-encoded signed transaction (when validate_only=false) */
    signed_transaction?: string;
    /** Error message if failed */
    error?: string;
    /** Validation result (when validate_only=true) */
    valid?: boolean;
    /** Reason for invalid transaction */
    validation_error?: string;
}
/**
 * Response from signAndSendTransaction endpoint
 */
export interface KoraSignAndSendTransactionResponse {
    /** Whether the transaction was successfully sent */
    success: boolean;
    /** Transaction signature (if successful) */
    signature?: string;
    /** Error message if failed */
    error?: string;
    /** Additional error details */
    error_details?: {
        code?: number;
        logs?: string[];
    };
}
/**
 * Response from getPayerSigner endpoint
 */
export interface KoraGetPayerSignerResponse {
    /** Kora's fee payer public key address */
    address: string;
    /** Alias for address (some versions use 'pubkey') */
    pubkey?: string;
}
/**
 * Kora JSON-RPC error response
 */
export interface KoraErrorResponse {
    error: {
        /** Error code */
        code: number;
        /** Human-readable error message */
        message: string;
        /** Additional error data */
        data?: any;
    };
}
/**
 * Standard JSON-RPC 2.0 request envelope
 */
export interface KoraRPCRequest<T = any> {
    jsonrpc: '2.0';
    id: number | string;
    method: string;
    params: T;
}
/**
 * Standard JSON-RPC 2.0 response envelope
 */
export interface KoraRPCResponse<T = any> {
    jsonrpc: '2.0';
    id: number | string;
    result?: T;
    error?: KoraErrorResponse['error'];
}
/**
 * Kora client configuration
 */
export interface KoraClientConfig {
    /** Kora RPC URL (default: http://localhost:8080) */
    rpcUrl: string;
    /** API key for authentication */
    apiKey: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Retry configuration */
    retry?: {
        /** Maximum number of retries (default: 3) */
        maxRetries?: number;
        /** Initial retry delay in ms (default: 1000) */
        initialDelay?: number;
        /** Backoff multiplier (default: 2) */
        backoffMultiplier?: number;
    };
}
/**
 * Kora health check response
 */
export interface KoraHealthResponse {
    status: 'ok' | 'degraded' | 'error';
    version?: string;
    network?: string;
    uptime?: number;
}
/**
 * Check if response is a Kora error
 */
export declare function isKoraError(response: KoraRPCResponse): response is KoraRPCResponse & {
    error: NonNullable<KoraErrorResponse['error']>;
};
/**
 * Check if sign transaction response indicates success
 */
export declare function isKoraSignSuccess(response: KoraSignTransactionResponse): response is KoraSignTransactionResponse & {
    success: true;
    signed_transaction: string;
};
/**
 * Check if sign and send response indicates success
 */
export declare function isKoraSendSuccess(response: KoraSignAndSendTransactionResponse): response is KoraSignAndSendTransactionResponse & {
    success: true;
    signature: string;
};
//# sourceMappingURL=kora-types.d.ts.map