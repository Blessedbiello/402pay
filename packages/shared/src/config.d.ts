/**
 * Configuration validation using Zod
 */
import { z } from 'zod';
/**
 * Facilitator configuration schema
 */
export declare const FacilitatorConfigSchema: any;
export type FacilitatorConfig = z.infer<typeof FacilitatorConfigSchema>;
/**
 * SDK configuration schema
 */
export declare const SDKConfigSchema: any;
export type SDKConfig = z.infer<typeof SDKConfigSchema>;
/**
 * MCP Server configuration schema
 */
export declare const MCPConfigSchema: any;
export type MCPConfig = z.infer<typeof MCPConfigSchema>;
/**
 * Validate and parse configuration
 */
export declare function validateConfig<T>(schema: z.ZodSchema<T>, env: Record<string, any>): T;
//# sourceMappingURL=config.d.ts.map