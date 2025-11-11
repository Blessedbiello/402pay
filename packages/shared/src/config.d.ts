/**
 * Configuration validation using Zod
 */
import { z } from 'zod';
/**
 * Facilitator configuration schema
 */
export declare const FacilitatorConfigSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, number, string>, z.ZodNumber>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    SOLANA_NETWORK: z.ZodDefault<z.ZodEnum<["mainnet-beta", "devnet", "testnet"]>>;
    SOLANA_RPC_URL: z.ZodOptional<z.ZodString>;
    VALID_API_KEYS: z.ZodDefault<z.ZodPipeline<z.ZodEffects<z.ZodString, string[], string>, z.ZodArray<z.ZodString, "many">>>;
    ALLOWED_ORIGINS: z.ZodOptional<z.ZodPipeline<z.ZodEffects<z.ZodString, string[], string>, z.ZodArray<z.ZodString, "many">>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<["error", "warn", "info", "debug"]>>;
    DATABASE_URL: z.ZodOptional<z.ZodString>;
    REDIS_URL: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    PORT: number;
    NODE_ENV: "test" | "development" | "production";
    SOLANA_NETWORK: "mainnet-beta" | "devnet" | "testnet";
    VALID_API_KEYS: string[];
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    SOLANA_RPC_URL?: string | undefined;
    ALLOWED_ORIGINS?: string[] | undefined;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
}, {
    PORT?: string | undefined;
    NODE_ENV?: "test" | "development" | "production" | undefined;
    SOLANA_NETWORK?: "mainnet-beta" | "devnet" | "testnet" | undefined;
    SOLANA_RPC_URL?: string | undefined;
    VALID_API_KEYS?: string | undefined;
    ALLOWED_ORIGINS?: string | undefined;
    LOG_LEVEL?: "error" | "warn" | "info" | "debug" | undefined;
    DATABASE_URL?: string | undefined;
    REDIS_URL?: string | undefined;
}>;
export type FacilitatorConfig = z.infer<typeof FacilitatorConfigSchema>;
/**
 * SDK configuration schema
 */
export declare const SDKConfigSchema: z.ZodObject<{
    SOLPAY402_API_KEY: z.ZodString;
    RECIPIENT_WALLET: z.ZodString;
    SOLANA_NETWORK: z.ZodDefault<z.ZodEnum<["mainnet-beta", "devnet", "testnet"]>>;
    FACILITATOR_URL: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    SOLANA_NETWORK: "mainnet-beta" | "devnet" | "testnet";
    SOLPAY402_API_KEY: string;
    RECIPIENT_WALLET: string;
    FACILITATOR_URL: string;
}, {
    SOLPAY402_API_KEY: string;
    RECIPIENT_WALLET: string;
    SOLANA_NETWORK?: "mainnet-beta" | "devnet" | "testnet" | undefined;
    FACILITATOR_URL?: string | undefined;
}>;
export type SDKConfig = z.infer<typeof SDKConfigSchema>;
/**
 * MCP Server configuration schema
 */
export declare const MCPConfigSchema: z.ZodObject<{
    SOLPAY402_API_KEY: z.ZodString;
    AGENT_WALLET_SECRET_KEY: z.ZodOptional<z.ZodString>;
    AGENT_OWNER: z.ZodDefault<z.ZodString>;
    SOLANA_NETWORK: z.ZodDefault<z.ZodEnum<["mainnet-beta", "devnet", "testnet"]>>;
    FACILITATOR_URL: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    SOLANA_NETWORK: "mainnet-beta" | "devnet" | "testnet";
    SOLPAY402_API_KEY: string;
    FACILITATOR_URL: string;
    AGENT_OWNER: string;
    AGENT_WALLET_SECRET_KEY?: string | undefined;
}, {
    SOLPAY402_API_KEY: string;
    SOLANA_NETWORK?: "mainnet-beta" | "devnet" | "testnet" | undefined;
    FACILITATOR_URL?: string | undefined;
    AGENT_WALLET_SECRET_KEY?: string | undefined;
    AGENT_OWNER?: string | undefined;
}>;
export type MCPConfig = z.infer<typeof MCPConfigSchema>;
/**
 * Validate and parse configuration
 */
export declare function validateConfig<T>(schema: z.ZodSchema<T>, env: Record<string, any>): T;
//# sourceMappingURL=config.d.ts.map