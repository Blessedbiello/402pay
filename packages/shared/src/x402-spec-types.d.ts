/**
 * x402 Protocol Types - Official Coinbase Specification
 * Based on: https://github.com/coinbase/x402
 *
 * These types match the official x402 specification exactly.
 * All field names and structures are spec-compliant.
 */
/**
 * x402 Protocol Version
 */
export declare const X402_SPEC_VERSION = 1;
/**
 * HTTP Status Codes
 */
export declare const X402_HTTP_STATUS: {
    readonly PAYMENT_REQUIRED: 402;
    readonly OK: 200;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
};
/**
 * HTTP Headers
 */
export declare const X402_HTTP_HEADERS: {
    readonly PAYMENT: "X-PAYMENT";
    readonly PAYMENT_RESPONSE: "X-PAYMENT-RESPONSE";
};
/**
 * Payment Schemes
 */
export declare enum X402PaymentScheme {
    EXACT = "exact"
}
/**
 * Supported Networks
 */
export declare enum X402Network {
    SOLANA = "solana",
    SOLANA_DEVNET = "solana-devnet",
    SOLANA_TESTNET = "solana-testnet",
    BASE = "base",
    BASE_SEPOLIA = "base-sepolia"
}
/**
 * Payment Requirements
 *
 * Specifies the payment terms required to access a resource.
 * This is returned in the 402 Payment Required response.
 */
export interface PaymentRequirements {
    /** Payment scheme identifier (e.g., "exact") */
    scheme: string;
    /** Blockchain network identifier (e.g., "solana-devnet") */
    network: string;
    /** Maximum amount required in smallest units (e.g., lamports for SOL) */
    maxAmountRequired: string;
    /**
     * Token/asset identifier
     * - For Solana: SPL token mint address (or empty for native SOL)
     * - For EVM: ERC20 contract address (or "0x0" for native ETH)
     */
    asset: string;
    /**
     * Recipient wallet address
     * IMPORTANT: Official spec uses "payTo", not "recipient"
     */
    payTo: string;
    /** Resource URL path being accessed */
    resource: string;
    /** Human-readable description of the resource */
    description: string;
    /** Response MIME type (optional) */
    mimeType?: string;
    /** JSON schema for response structure (optional) */
    outputSchema?: object | null;
    /**
     * Payment timeout in SECONDS
     * IMPORTANT: Official spec uses seconds, not milliseconds
     */
    maxTimeoutSeconds: number;
    /**
     * Scheme-specific metadata (optional)
     * IMPORTANT: Official spec uses "extra", not "metadata"
     */
    extra?: object | null;
}
/**
 * Payment Requirements Response (HTTP 402)
 *
 * Returned by the server when payment is required.
 */
export interface PaymentRequirementsResponse {
    /**
     * Protocol version
     * IMPORTANT: Official spec uses number, not string
     */
    x402Version: number;
    /**
     * Array of acceptable payment options
     * IMPORTANT: Official spec uses "accepts", not "paymentRequirements"
     */
    accepts: PaymentRequirements[];
    /** Optional error message */
    error?: string;
}
/**
 * Payment Payload
 *
 * Sent by the client in the X-PAYMENT header (base64-encoded).
 */
export interface PaymentPayload {
    /** Protocol version (number) */
    x402Version: number;
    /** Selected payment scheme */
    scheme: string;
    /** Blockchain network */
    network: string;
    /** Scheme-specific payment data */
    payload: SolanaPaymentData | EVMPaymentData;
}
/**
 * Solana Payment Data
 *
 * For "exact" scheme on Solana networks.
 */
export interface SolanaPaymentData {
    /**
     * Solana transaction signature
     * Present when user has already submitted transaction (direct RPC flow)
     * Optional when using gasless facilitator (Kora flow)
     */
    signature?: string;
    /**
     * Base64-encoded unsigned/partially-signed transaction
     * Used with gasless facilitators like Kora
     * The facilitator will sign as fee payer and submit to Solana
     */
    unsigned_transaction?: string;
    /** Payer's public key (base58) */
    from: string;
    /** Recipient's public key (base58) */
    to: string;
    /** Amount in smallest units (lamports or token units) */
    amount: string;
    /** SPL token mint address (optional, omit for native SOL) */
    mint?: string;
    /** Unix timestamp in milliseconds */
    timestamp: number;
    /** Additional metadata (optional) */
    metadata?: Record<string, any>;
}
/**
 * EVM Payment Data (for reference)
 *
 * For "exact" scheme on EVM networks (Base, etc.)
 */
export interface EVMPaymentData {
    /** Cryptographic signature */
    signature: string;
    /** Authorization object (EIP-3009 style) */
    authorization: {
        from: string;
        to: string;
        value: string;
        validAfter: string;
        validBefore: string;
        nonce: string;
    };
}
/**
 * Payment Response
 *
 * Sent by the server in the X-PAYMENT-RESPONSE header (base64-encoded).
 */
export interface PaymentResponse {
    /** Whether payment was successful */
    success: boolean;
    /**
     * Transaction hash/signature
     * IMPORTANT: Official spec uses "transaction", not "transactionHash"
     */
    transaction: string;
    /** Network identifier */
    network: string;
    /**
     * Payer address
     * IMPORTANT: Required field we were missing
     */
    payer: string;
    /** Error description if payment failed (optional) */
    errorReason?: string;
}
/**
 * Verify Request (POST /verify)
 *
 * Sent to facilitator to validate payment without settlement.
 */
export interface VerifyRequest {
    /** Protocol version */
    x402Version: number;
    /** Base64-encoded PaymentPayload from X-PAYMENT header */
    paymentHeader: string;
    /** Original payment requirements from 402 response */
    paymentRequirements: PaymentRequirements;
}
/**
 * Verify Response (POST /verify)
 *
 * Returned by facilitator after validation.
 */
export interface VerifyResponse {
    /** Whether payment is valid */
    isValid: boolean;
    /** Reason if invalid (optional) */
    invalidReason?: string | null;
    /** Verified payer address (optional) */
    payer?: string;
}
/**
 * Settle Request (POST /settle)
 *
 * Sent to facilitator to execute payment on-chain.
 */
export interface SettleRequest {
    /** Protocol version */
    x402Version: number;
    /** Base64-encoded PaymentPayload from X-PAYMENT header */
    paymentHeader: string;
    /** Original payment requirements from 402 response */
    paymentRequirements: PaymentRequirements;
}
/**
 * Settle Response (POST /settle)
 *
 * Returned by facilitator after settlement.
 */
export interface SettleResponse {
    /** Whether settlement was successful */
    success: boolean;
    /** Error message if failed (optional) */
    error?: string | null;
    /** Blockchain transaction hash/signature */
    txHash: string;
    /** Network identifier */
    networkId: string;
    /** Payer address (optional) */
    payer?: string;
}
/**
 * Supported Kind
 *
 * Describes a supported (scheme, network) combination.
 */
export interface SupportedKind {
    /** Protocol version */
    x402Version: number;
    /** Payment scheme */
    scheme: string;
    /** Blockchain network */
    network: string;
    /** Fee payer address (optional, for gasless facilitators like Kora) */
    feePayer?: string;
}
/**
 * Supported Response (GET /supported)
 *
 * Returned by facilitator to advertise capabilities.
 */
export interface SupportedResponse {
    /** Array of supported (scheme, network) combinations */
    kinds: SupportedKind[];
}
/**
 * x402 Error Codes
 */
export declare enum X402ErrorCode {
    INVALID_PAYMENT = "INVALID_PAYMENT",
    INSUFFICIENT_AMOUNT = "INSUFFICIENT_AMOUNT",
    EXPIRED_PAYMENT = "EXPIRED_PAYMENT",
    INVALID_SIGNATURE = "INVALID_SIGNATURE",
    INVALID_NETWORK = "INVALID_NETWORK",
    INVALID_SCHEME = "INVALID_SCHEME",
    SETTLEMENT_FAILED = "SETTLEMENT_FAILED",
    ALREADY_SETTLED = "ALREADY_SETTLED",
    FACILITATOR_ERROR = "FACILITATOR_ERROR"
}
/**
 * x402 Facilitator Configuration
 * (Renamed to avoid conflict with app FacilitatorConfig)
 */
export interface X402FacilitatorConfig {
    /** Facilitator base URL */
    url: string;
    /** Network to operate on */
    network: X402Network | string;
    /** Solana RPC URL (optional) */
    rpcUrl?: string;
    /** Timeout for facilitator requests in milliseconds (optional) */
    timeout?: number;
}
/**
 * x402 Middleware Configuration
 */
export interface X402MiddlewareConfig {
    /** Amount required in smallest units */
    amount: string;
    /** Recipient wallet address (maps to "payTo" in spec) */
    payTo: string;
    /** Resource description */
    description: string;
    /** Token/asset identifier (SPL mint or ERC20 address) */
    asset?: string;
    /** Payment scheme (default: "exact") */
    scheme?: string;
    /** Network (default: "solana-devnet") */
    network?: string;
    /** Resource MIME type (optional) */
    mimeType?: string;
    /** Timeout in seconds (optional, default: 60) */
    maxTimeoutSeconds?: number;
    /** Scheme-specific metadata (optional) */
    extra?: object | null;
    /** Facilitator URL (required) */
    facilitatorUrl: string;
}
/**
 * Type guard to check if payload is Solana payment data
 * Supports both direct RPC flow (with signature) and Kora gasless flow (with unsigned_transaction)
 */
export declare function isSolanaPaymentData(payload: any): payload is SolanaPaymentData;
/**
 * Type guard to check if payload is EVM payment data
 */
export declare function isEVMPaymentData(payload: any): payload is EVMPaymentData;
//# sourceMappingURL=x402-spec-types.d.ts.map