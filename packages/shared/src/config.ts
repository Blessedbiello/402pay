/**
 * Configuration validation using Zod
 */

import { z } from 'zod';
import { Network } from './types';

/**
 * Facilitator configuration schema
 */
export const FacilitatorConfigSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive())
    .default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SOLANA_NETWORK: Network.default('devnet'),
  SOLANA_RPC_URL: z.string().url().optional(),
  VALID_API_KEYS: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .pipe(z.array(z.string()))
    .default(''),
  ALLOWED_ORIGINS: z
    .string()
    .transform((val) => val.split(',').filter(Boolean))
    .pipe(z.array(z.string()))
    .optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().url().optional(),
});

export type FacilitatorConfig = z.infer<typeof FacilitatorConfigSchema>;

/**
 * SDK configuration schema
 */
export const SDKConfigSchema = z.object({
  SOLPAY402_API_KEY: z.string().min(1),
  RECIPIENT_WALLET: z.string().min(32),
  SOLANA_NETWORK: Network.default('devnet'),
  FACILITATOR_URL: z.string().url().default('http://localhost:3001'),
});

export type SDKConfig = z.infer<typeof SDKConfigSchema>;

/**
 * MCP Server configuration schema
 */
export const MCPConfigSchema = z.object({
  SOLPAY402_API_KEY: z.string().min(1),
  AGENT_WALLET_SECRET_KEY: z.string().optional(),
  AGENT_OWNER: z.string().default('mcp-server'),
  SOLANA_NETWORK: Network.default('devnet'),
  FACILITATOR_URL: z.string().url().default('http://localhost:3001'),
});

export type MCPConfig = z.infer<typeof MCPConfigSchema>;

/**
 * Validate and parse configuration
 */
export function validateConfig<T>(schema: z.ZodSchema<T>, env: Record<string, any>): T {
  try {
    return schema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid configuration');
    }
    throw error;
  }
}
