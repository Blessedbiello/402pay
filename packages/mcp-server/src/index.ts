#!/usr/bin/env node

/**
 * 402pay MCP Server
 * Model Context Protocol server for AI agent payments
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { SolPay402 } from '@402pay/sdk';
import { Keypair, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { TOKEN_MINTS } from '@402pay/shared';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Tool schemas
const MakePaymentSchema = z.object({
  url: z.string().url().describe('The API endpoint to call'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('GET'),
  body: z.any().optional().describe('Request body (for POST/PUT)'),
  headers: z.record(z.string()).optional().describe('Additional headers'),
});

const GetBalanceSchema = z.object({
  walletAddress: z.string().describe('Solana wallet public key'),
});

const CreateAgentWalletSchema = z.object({
  name: z.string().describe('Agent name'),
  spendingLimitDaily: z.number().positive().optional(),
  allowedServices: z.array(z.string()).optional(),
});

/**
 * Initialize 402pay SDK
 */
const solpay = new SolPay402({
  apiKey: process.env.SOLPAY402_API_KEY || '',
  network: (process.env.SOLANA_NETWORK as any) || 'devnet',
  facilitatorUrl: process.env.FACILITATOR_URL || 'http://localhost:3001',
});

/**
 * Load agent wallet from environment or create new one
 */
let agentWallet: Keypair;
try {
  if (process.env.AGENT_WALLET_SECRET_KEY) {
    const secretKey = JSON.parse(process.env.AGENT_WALLET_SECRET_KEY);
    agentWallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } else {
    agentWallet = Keypair.generate();
    console.error(
      '⚠️  No wallet found. Generated new wallet:',
      agentWallet.publicKey.toBase58()
    );
    console.error(
      '   Save this to AGENT_WALLET_SECRET_KEY:',
      JSON.stringify(Array.from(agentWallet.secretKey))
    );
  }
} catch (error) {
  console.error('Error loading wallet:', error);
  process.exit(1);
}

/**
 * MCP Server Tools
 */
const tools: Tool[] = [
  {
    name: 'make_paid_request',
    description:
      'Make an API request that requires x402 payment. Automatically handles payment flow.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'The API endpoint URL to call',
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE'],
          default: 'GET',
          description: 'HTTP method',
        },
        body: {
          type: 'object',
          description: 'Request body for POST/PUT requests',
        },
        headers: {
          type: 'object',
          description: 'Additional HTTP headers',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'get_wallet_balance',
    description: 'Get the balance of a Solana wallet (SOL and USDC)',
    inputSchema: {
      type: 'object',
      properties: {
        walletAddress: {
          type: 'string',
          description: 'Solana wallet public key',
        },
      },
      required: ['walletAddress'],
    },
  },
  {
    name: 'create_agent_wallet',
    description:
      'Create a new managed agent wallet with spending limits for secure autonomous payments',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name for the agent wallet',
        },
        spendingLimitDaily: {
          type: 'number',
          description: 'Daily spending limit in USDC',
        },
        allowedServices: {
          type: 'array',
          items: { type: 'string' },
          description: 'Whitelist of allowed API endpoints',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'get_agent_info',
    description: 'Get information about the current agent wallet including reputation',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Handle make_paid_request tool
 */
async function handleMakePaidRequest(args: z.infer<typeof MakePaymentSchema>) {
  try {
    // Step 1: Make initial request
    const response = await fetch(args.url, {
      method: args.method,
      headers: {
        'Content-Type': 'application/json',
        ...args.headers,
      },
      body: args.body ? JSON.stringify(args.body) : undefined,
    });

    // Step 2: Check if payment is required
    if (response.status === 402) {
      const paymentRequirement = await response.json();

      console.error('💳 Payment required:', paymentRequirement.requirement);

      // Step 3: Make payment
      const proof = await solpay.pay({
        requirement: paymentRequirement.requirement,
        payer: agentWallet,
      });

      console.error('✅ Payment sent:', proof.transactionId);

      // Step 4: Retry request with payment proof
      const paidResponse = await fetch(args.url, {
        method: args.method,
        headers: {
          'Content-Type': 'application/json',
          'X-PAYMENT': Buffer.from(JSON.stringify(proof)).toString('base64'),
          ...args.headers,
        },
        body: args.body ? JSON.stringify(args.body) : undefined,
      });

      if (!paidResponse.ok) {
        throw new Error(`Request failed: ${paidResponse.statusText}`);
      }

      const data = await paidResponse.json();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                paid: true,
                amount: paymentRequirement.requirement.amount,
                currency: paymentRequirement.requirement.currency,
                transactionId: proof.transactionId,
                data,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // No payment required
    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: true, paid: false, data }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            { success: false, error: (error as Error).message },
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle get_wallet_balance tool
 */
async function handleGetBalance(args: z.infer<typeof GetBalanceSchema>) {
  try {
    const connection = solpay.getConnection();
    const publicKey = new PublicKey(args.walletAddress);
    const network = solpay.getNetwork();

    // Get SOL balance
    const balance = await connection.getBalance(publicKey);
    const solBalance = balance / 1e9; // Convert lamports to SOL

    // Get USDC balance using SPL token account
    let usdcBalance = 0;
    try {
      const usdcMint = new PublicKey(TOKEN_MINTS.USDC[network]);
      const usdcTokenAccount = await getAssociatedTokenAddress(usdcMint, publicKey);
      const accountInfo = await getAccount(connection, usdcTokenAccount);
      usdcBalance = Number(accountInfo.amount) / 1e6; // USDC has 6 decimals
    } catch (error) {
      // Token account might not exist if wallet has no USDC
      usdcBalance = 0;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              walletAddress: args.walletAddress,
              balances: {
                SOL: solBalance,
                USDC: usdcBalance,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: (error as Error).message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle create_agent_wallet tool
 */
async function handleCreateAgentWallet(args: z.infer<typeof CreateAgentWalletSchema>) {
  try {
    // Create agent wallet in facilitator with current MCP server wallet
    const agent = await solpay.agents.create({
      name: args.name,
      publicKey: agentWallet.publicKey.toBase58(),
      owner: process.env.AGENT_OWNER || 'mcp-server',
      spendingLimit: {
        daily: args.spendingLimitDaily || 100, // Default $100/day
        perTransaction: 10, // Default $10 per transaction
      },
      allowedServices: args.allowedServices,
      metadata: {
        createdBy: 'mcp-server',
        timestamp: Date.now(),
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: true,
              agent: {
                id: agent.id,
                name: agent.name,
                publicKey: agent.publicKey,
                spendingLimit: agent.spendingLimit,
                allowedServices: agent.allowedServices,
                reputation: agent.reputation,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: (error as Error).message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Handle get_agent_info tool
 */
async function handleGetAgentInfo() {
  try {
    const publicKey = agentWallet.publicKey.toBase58();

    // Try to get reputation from facilitator
    let reputation = null;
    try {
      reputation = await solpay.agents.getReputation(publicKey);
    } catch (error) {
      // Agent might not be registered yet
      reputation = { score: 0, transactionCount: 0, trustLevel: 'new' as const };
    }

    // Get wallet balance
    const connection = solpay.getConnection();
    const balance = await connection.getBalance(agentWallet.publicKey);
    const solBalance = balance / 1e9;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              publicKey,
              network: solpay.getNetwork(),
              facilitator: process.env.FACILITATOR_URL || 'http://localhost:3001',
              balance: {
                SOL: solBalance,
              },
              reputation,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: (error as Error).message }, null, 2),
        },
      ],
      isError: true,
    };
  }
}

/**
 * Initialize MCP Server
 */
const server = new Server(
  {
    name: '402pay-mcp',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'make_paid_request':
        return await handleMakePaidRequest(MakePaymentSchema.parse(args));

      case 'get_wallet_balance':
        return await handleGetBalance(GetBalanceSchema.parse(args));

      case 'create_agent_wallet':
        return await handleCreateAgentWallet(CreateAgentWalletSchema.parse(args));

      case 'get_agent_info':
        return await handleGetAgentInfo();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: (error as Error).message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('🤖 402pay MCP Server running');
  console.error('   Wallet:', agentWallet.publicKey.toBase58());
  console.error('   Network:', process.env.SOLANA_NETWORK || 'devnet');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
