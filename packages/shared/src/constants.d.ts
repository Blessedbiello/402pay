/**
 * Constants used across the 402pay platform
 */
import { Network, TokenType } from './types';
export declare const TOKEN_MINTS: Record<TokenType, Record<Network, string>>;
export declare const TOKEN_DECIMALS: Record<TokenType, number>;
export declare const DEFAULT_RPC_ENDPOINTS: Record<Network, string>;
export declare const PAYMENT_REQUIREMENT_EXPIRATION: number;
export declare const DEFAULT_SETTLEMENT_DELAY: number;
export declare const MINIMUM_SETTLEMENT_AMOUNT = 1;
export declare const DEFAULT_RATE_LIMITS: {
    perMinute: number;
    perHour: number;
    perDay: number;
};
export declare const REPUTATION_THRESHOLDS: {
    new: number;
    verified: number;
    trusted: number;
    premium: number;
};
export declare const HTTP_STATUS: {
    readonly PAYMENT_REQUIRED: 402;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly TOO_MANY_REQUESTS: 429;
    readonly INTERNAL_SERVER_ERROR: 500;
};
export declare const ERROR_CODES: {
    readonly INVALID_PAYMENT: "INVALID_PAYMENT";
    readonly PAYMENT_EXPIRED: "PAYMENT_EXPIRED";
    readonly INSUFFICIENT_AMOUNT: "INSUFFICIENT_AMOUNT";
    readonly INVALID_SIGNATURE: "INVALID_SIGNATURE";
    readonly NONCE_MISMATCH: "NONCE_MISMATCH";
    readonly TRANSACTION_FAILED: "TRANSACTION_FAILED";
    readonly SUBSCRIPTION_NOT_FOUND: "SUBSCRIPTION_NOT_FOUND";
    readonly SUBSCRIPTION_INACTIVE: "SUBSCRIPTION_INACTIVE";
    readonly RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED";
    readonly AGENT_NOT_FOUND: "AGENT_NOT_FOUND";
    readonly INVALID_API_KEY: "INVALID_API_KEY";
    readonly AMOUNT_MISMATCH: "AMOUNT_MISMATCH";
    readonly RECIPIENT_MISMATCH: "RECIPIENT_MISMATCH";
    readonly CURRENCY_MISMATCH: "CURRENCY_MISMATCH";
    readonly REPLAY_ATTACK: "REPLAY_ATTACK";
};
export declare const PAYMENT_PROOF_EXPIRY_MS: number;
export declare const RATE_LIMITS: {
    readonly PUBLIC_ENDPOINT_PER_MINUTE: 60;
    readonly AUTHENTICATED_PER_MINUTE: 300;
    readonly VERIFICATION_PER_MINUTE: 100;
};
//# sourceMappingURL=constants.d.ts.map