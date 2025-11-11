"use strict";
/**
 * Configuration validation using Zod
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPConfigSchema = exports.SDKConfigSchema = exports.FacilitatorConfigSchema = void 0;
exports.validateConfig = validateConfig;
const zod_1 = require("zod");
const types_1 = require("./types");
/**
 * Facilitator configuration schema
 */
exports.FacilitatorConfigSchema = zod_1.z.object({
    PORT: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().int().positive())
        .default('3001'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    SOLANA_NETWORK: types_1.Network.default('devnet'),
    SOLANA_RPC_URL: zod_1.z.string().url().optional(),
    VALID_API_KEYS: zod_1.z
        .string()
        .transform((val) => val.split(',').filter(Boolean))
        .pipe(zod_1.z.array(zod_1.z.string()))
        .default(''),
    ALLOWED_ORIGINS: zod_1.z
        .string()
        .transform((val) => val.split(',').filter(Boolean))
        .pipe(zod_1.z.array(zod_1.z.string()))
        .optional(),
    LOG_LEVEL: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    DATABASE_URL: zod_1.z.string().url().optional(),
    REDIS_URL: zod_1.z.string().url().optional(),
});
/**
 * SDK configuration schema
 */
exports.SDKConfigSchema = zod_1.z.object({
    SOLPAY402_API_KEY: zod_1.z.string().min(1),
    RECIPIENT_WALLET: zod_1.z.string().min(32),
    SOLANA_NETWORK: types_1.Network.default('devnet'),
    FACILITATOR_URL: zod_1.z.string().url().default('http://localhost:3001'),
});
/**
 * MCP Server configuration schema
 */
exports.MCPConfigSchema = zod_1.z.object({
    SOLPAY402_API_KEY: zod_1.z.string().min(1),
    AGENT_WALLET_SECRET_KEY: zod_1.z.string().optional(),
    AGENT_OWNER: zod_1.z.string().default('mcp-server'),
    SOLANA_NETWORK: types_1.Network.default('devnet'),
    FACILITATOR_URL: zod_1.z.string().url().default('http://localhost:3001'),
});
/**
 * Validate and parse configuration
 */
function validateConfig(schema, env) {
    try {
        return schema.parse(env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('❌ Configuration validation failed:');
            error.errors.forEach((err) => {
                console.error(`  - ${err.path.join('.')}: ${err.message}`);
            });
            throw new Error('Invalid configuration');
        }
        throw error;
    }
}
//# sourceMappingURL=config.js.map