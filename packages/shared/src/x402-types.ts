/**
 * x402 Protocol Types - Official Specification Compliance
 * Based on: https://github.com/coinbase/x402
 */

/**
 * x402 Payment Requirement
 * Defines what payment is required to access a resource
 */
export interface X402PaymentRequirement {
  /** Payment scheme (e.g., "exact" for fixed amount payments) */
  scheme: string;

  /** Blockchain network (e.g., "solana", "solana-devnet") */
  network: string;

  /** Maximum amount required in smallest units (e.g., lamports for SOL) */
  maxAmountRequired: string;

  /** Recipient wallet address */
  recipient: string;

  /** Resource being purchased */
  resource: string;

  /** Human-readable description */
  description: string;

  /** MIME type of the resource */
  mimeType?: string;

  /** Token address for SPL tokens (optional, omit for native SOL) */
  assetAddress?: string;

  /** Timeout in milliseconds */
  timeout?: number;

  /** Additional scheme-specific metadata */
  metadata?: Record<string, any>;
}

/**
 * x402 Payment Required Response (HTTP 402)
 * Returned when payment is required to access a resource
 */
export interface X402PaymentRequiredResponse {
  /** x402 protocol version */
  x402Version: string;

  /** Array of acceptable payment methods */
  paymentRequirements: X402PaymentRequirement[];

  /** Error details if previous payment attempt failed */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Payment Payload sent by client in X-PAYMENT header
 */
export interface X402PaymentPayload {
  /** x402 protocol version */
  x402Version: string;

  /** Payment scheme used */
  scheme: string;

  /** Network used for payment */
  network: string;

  /** Scheme-specific payload data */
  payload: {
    /** Transaction signature on Solana */
    signature: string;

    /** Sender's public key */
    from: string;

    /** Recipient's public key */
    to: string;

    /** Amount transferred in smallest units */
    amount: string;

    /** Token mint address (for SPL tokens) */
    mint?: string;

    /** Timestamp of payment */
    timestamp: number;

    /** Additional metadata */
    metadata?: Record<string, any>;
  };
}

/**
 * Payment Response sent by server in X-PAYMENT-RESPONSE header
 */
export interface X402PaymentResponse {
  /** Whether payment was accepted */
  success: boolean;

  /** Transaction hash/signature for verification */
  transactionHash?: string;

  /** Network where transaction was processed */
  network?: string;

  /** Error details if payment was rejected */
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  /** Resource metadata */
  resource?: {
    id: string;
    type: string;
    expiresAt?: number;
  };
}

/**
 * x402 Verification Request (to facilitator)
 */
export interface X402VerificationRequest {
  /** x402 protocol version */
  x402Version: string;

  /** Payment header from client (base64 encoded X402PaymentPayload) */
  paymentHeader: string;

  /** Original payment requirements */
  paymentRequirements: X402PaymentRequirement;
}

/**
 * x402 Verification Response (from facilitator)
 */
export interface X402VerificationResponse {
  /** Whether payment is valid */
  isValid: boolean;

  /** Reason if invalid */
  invalidReason?: string;

  /** Verified payment details */
  payment?: {
    from: string;
    to: string;
    amount: string;
    signature: string;
    network: string;
    timestamp: number;
  };
}

/**
 * x402 Settlement Request (to facilitator)
 */
export interface X402SettlementRequest extends X402VerificationRequest {
  /** Whether to force settlement even if already settled */
  force?: boolean;
}

/**
 * x402 Settlement Response (from facilitator)
 */
export interface X402SettlementResponse {
  /** Whether settlement was successful */
  success: boolean;

  /** Error message if failed */
  error?: string;

  /** Transaction hash on blockchain */
  transactionHash?: string;

  /** Network identifier */
  network?: string;

  /** Settlement details */
  settlement?: {
    from: string;
    to: string;
    amount: string;
    fee?: string;
    timestamp: number;
  };
}

/**
 * x402 Protocol Version
 */
export const X402_VERSION = '0.1.0';

/**
 * x402 Header Names
 */
export const X402_HEADERS = {
  PAYMENT: 'X-PAYMENT',
  PAYMENT_RESPONSE: 'X-PAYMENT-RESPONSE',
} as const;

/**
 * x402 HTTP Status Codes
 */
export const X402_STATUS = {
  PAYMENT_REQUIRED: 402,
  OK: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  BAD_REQUEST: 400,
} as const;

/**
 * x402 Payment Schemes (LEGACY - use X402PaymentScheme from x402-spec-types instead)
 * @deprecated
 */
export enum X402PaymentSchemeLegacy {
  EXACT = 'exact',
  UPTO = 'upto', // Future: consumption-based pricing
}

/**
 * x402 Supported Networks (LEGACY - use X402Network from x402-spec-types instead)
 * @deprecated
 */
export enum X402SupportedNetwork {
  SOLANA = 'solana',
  SOLANA_DEVNET = 'solana-devnet',
  SOLANA_TESTNET = 'solana-testnet',
}

/**
 * Error Codes (LEGACY - use X402ErrorCode from x402-spec-types instead)
 * @deprecated
 */
export enum X402ErrorCodeLegacy {
  INVALID_PAYMENT = 'INVALID_PAYMENT',
  INSUFFICIENT_AMOUNT = 'INSUFFICIENT_AMOUNT',
  EXPIRED_PAYMENT = 'EXPIRED_PAYMENT',
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  INVALID_NETWORK = 'INVALID_NETWORK',
  SETTLEMENT_FAILED = 'SETTLEMENT_FAILED',
  ALREADY_SETTLED = 'ALREADY_SETTLED',
}
