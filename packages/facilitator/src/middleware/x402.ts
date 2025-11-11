/**
 * x402 Protocol Middleware
 * Implements HTTP 402 Payment Required standard
 *
 * SPEC COMPLIANT - Based on official Coinbase x402 specification
 * https://github.com/coinbase/x402
 */

import { Request, Response, NextFunction } from 'express';
import {
  // Spec-compliant types
  PaymentRequirements,
  PaymentRequirementsResponse,
  PaymentPayload,
  PaymentResponse,
  SolanaPaymentData,
  VerifyResponse,
  isSolanaPaymentData,
  X402_SPEC_VERSION,
  X402_HTTP_HEADERS,
  X402_HTTP_STATUS,
  X402ErrorCode,
} from '@402pay/shared';
import { Connection, PublicKey } from '@solana/web3.js';
import { logger } from '../utils/logger';

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');

export interface X402Request extends Request {
  x402Payment?: PaymentPayload;
  x402Verified?: boolean;
}

/**
 * x402 Configuration for a protected route
 * SPEC COMPLIANT - Uses official field names
 */
export interface X402Config {
  /** Amount required in lamports (for SOL) or token smallest units */
  amount: string;

  /** Recipient wallet address (spec: "payTo") */
  payTo: string;

  /** Resource description */
  description: string;

  /** Network (solana, solana-devnet, etc.) */
  network?: string;

  /** Token mint address (spec: "asset", optional for native SOL) */
  asset?: string;

  /** MIME type of resource */
  mimeType?: string;

  /** Timeout in SECONDS (spec: "maxTimeoutSeconds") */
  maxTimeoutSeconds?: number;

  /** Scheme-specific metadata (spec: "extra") */
  extra?: object | null;

  /** Output schema (optional) */
  outputSchema?: object | null;

  /** Facilitator URL for gasless transactions (optional) */
  facilitatorUrl?: string;

  /** Enable gasless flow (uses facilitator instead of on-chain verification) */
  useGasless?: boolean;
}

/**
 * Create x402 middleware for a protected route
 *
 * Usage:
 * ```typescript
 * app.get('/api/premium-data',
 *   x402Middleware({
 *     amount: '1000000', // 0.001 SOL (1M lamports)
 *     payTo: 'YOUR_WALLET_ADDRESS',
 *     description: 'Premium data access',
 *     maxTimeoutSeconds: 60, // 60 seconds
 *   }),
 *   (req, res) => {
 *     // Payment verified, serve content
 *     res.json({ data: 'Premium content' });
 *   }
 * );
 * ```
 */
export function x402Middleware(config: X402Config) {
  return async (req: X402Request, res: Response, next: NextFunction) => {
    try {
      // Check if X-PAYMENT header is present
      const paymentHeader = req.headers[X402_HTTP_HEADERS.PAYMENT.toLowerCase()] as string;

      if (!paymentHeader) {
        // No payment provided - return 402 with payment requirements
        return send402Response(req, res, config);
      }

      // Parse and verify payment
      const verification = await verifyPayment(paymentHeader, config, req);

      if (!verification.isValid) {
        // Invalid payment - return 402 with error
        return send402Response(req, res, config, verification.invalidReason);
      }

      // Payment verified - attach to request and continue
      req.x402Payment = verification.payment;
      req.x402Verified = true;

      // Add payment response header (SPEC COMPLIANT)
      const solanaPayload = isSolanaPaymentData(verification.payment?.payload)
        ? (verification.payment?.payload as SolanaPaymentData)
        : null;

      // For direct RPC flow, we have a transaction signature
      // For gasless flow, transaction will be settled later
      const paymentResponse: PaymentResponse = {
        success: true,
        transaction: solanaPayload?.signature || '', // Empty for gasless until settlement
        network: config.network || 'solana-devnet',
        payer: solanaPayload?.from || '',
      };

      res.setHeader(
        X402_HTTP_HEADERS.PAYMENT_RESPONSE,
        Buffer.from(JSON.stringify(paymentResponse)).toString('base64')
      );

      next();
    } catch (error) {
      logger.error('x402 middleware error', { error });
      res.status(X402_HTTP_STATUS.BAD_REQUEST).json({
        error: 'Payment processing error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

/**
 * Send HTTP 402 Payment Required response
 * SPEC COMPLIANT - Uses official field names
 */
function send402Response(
  req: Request,
  res: Response,
  config: X402Config,
  error?: string
) {
  // Build spec-compliant PaymentRequirements
  const paymentRequirement: PaymentRequirements = {
    scheme: 'exact',
    network: config.network || 'solana-devnet',
    maxAmountRequired: config.amount,
    payTo: config.payTo, // SPEC COMPLIANT
    asset: config.asset || '', // SPEC COMPLIANT (empty string for native SOL)
    resource: req.path,
    description: config.description,
    mimeType: config.mimeType || 'application/json',
    outputSchema: config.outputSchema || null,
    maxTimeoutSeconds: config.maxTimeoutSeconds || 60, // SPEC COMPLIANT (seconds, not ms)
    extra: config.extra || null, // SPEC COMPLIANT
  };

  // Build spec-compliant 402 response
  const response: PaymentRequirementsResponse = {
    x402Version: X402_SPEC_VERSION, // SPEC COMPLIANT (number, not string)
    accepts: [paymentRequirement], // SPEC COMPLIANT (was "paymentRequirements")
    ...(error && { error }),
  };

  res.status(X402_HTTP_STATUS.PAYMENT_REQUIRED).json(response);
}

/**
 * Verify payment from X-PAYMENT header
 * SPEC COMPLIANT - Uses spec types and field names
 */
async function verifyPayment(
  paymentHeader: string,
  config: X402Config,
  req: Request
): Promise<{
  isValid: boolean;
  invalidReason?: string;
  payment?: PaymentPayload;
}> {
  try {
    // Decode base64 payment payload
    const payloadJson = Buffer.from(paymentHeader, 'base64').toString('utf-8');
    const payment: PaymentPayload = JSON.parse(payloadJson);

    // Verify x402 version
    if (payment.x402Version !== X402_SPEC_VERSION) {
      return {
        isValid: false,
        invalidReason: `Unsupported x402 version: ${payment.x402Version}`,
      };
    }

    // Verify scheme
    if (payment.scheme !== 'exact') {
      return {
        isValid: false,
        invalidReason: `Unsupported payment scheme: ${payment.scheme}`,
      };
    }

    // Verify network
    const expectedNetwork = config.network || 'solana-devnet';
    if (payment.network !== expectedNetwork) {
      return {
        isValid: false,
        invalidReason: `Network mismatch. Expected ${expectedNetwork}, got ${payment.network}`,
      };
    }

    // Verify this is Solana payment data
    if (!isSolanaPaymentData(payment.payload)) {
      return {
        isValid: false,
        invalidReason: 'Invalid Solana payment data',
      };
    }

    const solanaPayload = payment.payload as SolanaPaymentData;

    // Verify amount
    const paidAmount = BigInt(solanaPayload.amount);
    const requiredAmount = BigInt(config.amount);
    if (paidAmount < requiredAmount) {
      return {
        isValid: false,
        invalidReason: `Insufficient amount. Required ${requiredAmount}, got ${paidAmount}`,
      };
    }

    // Verify recipient (SPEC: uses "payTo")
    if (solanaPayload.to !== config.payTo) {
      return {
        isValid: false,
        invalidReason: `Recipient mismatch. Expected ${config.payTo}, got ${solanaPayload.to}`,
      };
    }

    // Verify token (if specified) (SPEC: uses "asset")
    if (config.asset) {
      if (solanaPayload.mint !== config.asset) {
        return {
          isValid: false,
          invalidReason: `Token mismatch. Expected ${config.asset}, got ${solanaPayload.mint}`,
        };
      }
    }

    // Determine verification flow: gasless (Kora) or direct RPC
    const isGaslessFlow = config.useGasless || solanaPayload.unsigned_transaction;

    if (isGaslessFlow) {
      // Gasless flow: verify through facilitator (Kora)
      if (!solanaPayload.unsigned_transaction) {
        return {
          isValid: false,
          invalidReason: 'Gasless flow requires unsigned_transaction field',
        };
      }

      const facilitatorUrl = config.facilitatorUrl ||
        process.env.KORA_FACILITATOR_URL ||
        'http://localhost:3001/x402/kora';

      const isValid = await verifyWithFacilitator(
        paymentHeader,
        config,
        facilitatorUrl
      );

      if (!isValid) {
        return {
          isValid: false,
          invalidReason: 'Facilitator verification failed',
        };
      }
    } else {
      // Direct RPC flow: verify transaction on Solana blockchain
      if (!solanaPayload.signature) {
        return {
          isValid: false,
          invalidReason: 'Direct RPC flow requires signature field',
        };
      }

      const isOnChain = await verifyTransactionOnChain(
        solanaPayload.signature,
        payment.network
      );

      if (!isOnChain) {
        return {
          isValid: false,
          invalidReason: 'Transaction not found on blockchain or not confirmed',
        };
      }
    }

    // Check timeout (SPEC: maxTimeoutSeconds is in SECONDS, not milliseconds)
    if (config.maxTimeoutSeconds) {
      const ageSeconds = Math.floor((Date.now() - solanaPayload.timestamp) / 1000);
      if (ageSeconds > config.maxTimeoutSeconds) {
        return {
          isValid: false,
          invalidReason: `Payment expired. Timeout: ${config.maxTimeoutSeconds}s, Age: ${ageSeconds}s`,
        };
      }
    }

    logger.info('x402 payment verified', {
      signature: solanaPayload.signature,
      from: solanaPayload.from,
      to: solanaPayload.to,
      amount: solanaPayload.amount,
    });

    return {
      isValid: true,
      payment,
    };
  } catch (error) {
    logger.error('Payment verification error', { error });
    return {
      isValid: false,
      invalidReason: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Verify transaction exists on Solana blockchain
 */
async function verifyTransactionOnChain(
  signature: string,
  network: string
): Promise<boolean> {
  try {
    // Get connection for the specified network
    const rpcUrl = getRpcUrl(network);
    const conn = new Connection(rpcUrl, 'confirmed');

    // Fetch transaction
    const tx = await conn.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      logger.warn('Transaction not found on chain', { signature, network });
      return false;
    }

    // Check if transaction was successful
    if (tx.meta?.err) {
      logger.warn('Transaction failed on chain', {
        signature,
        error: tx.meta.err,
      });
      return false;
    }

    logger.info('Transaction verified on chain', {
      signature,
      slot: tx.slot,
      blockTime: tx.blockTime,
    });

    return true;
  } catch (error) {
    logger.error('Blockchain verification error', { error, signature, network });
    return false;
  }
}

/**
 * Verify payment with gasless facilitator (Kora)
 * Calls the facilitator's /verify endpoint
 */
async function verifyWithFacilitator(
  paymentHeader: string,
  config: X402Config,
  facilitatorUrl: string
): Promise<boolean> {
  try {
    const paymentRequirements: PaymentRequirements = {
      scheme: 'exact',
      network: config.network || 'solana-devnet',
      maxAmountRequired: config.amount,
      payTo: config.payTo,
      asset: config.asset || '',
      resource: '',
      description: config.description,
      mimeType: config.mimeType || 'application/json',
      outputSchema: config.outputSchema || null,
      maxTimeoutSeconds: config.maxTimeoutSeconds || 60,
      extra: config.extra || null,
    };

    const verifyRequest = {
      x402Version: X402_SPEC_VERSION,
      paymentHeader,
      paymentRequirements,
    };

    const response = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyRequest),
    });

    if (!response.ok) {
      logger.error('Facilitator verification HTTP error', {
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    const result = await response.json() as VerifyResponse;

    if (!result.isValid) {
      logger.warn('Facilitator verification failed', {
        reason: result.invalidReason,
      });
      return false;
    }

    logger.info('Facilitator verification successful', {
      payer: result.payer,
    });

    return true;
  } catch (error) {
    logger.error('Facilitator verification error', { error, facilitatorUrl });
    return false;
  }
}

/**
 * Get RPC URL for network
 */
function getRpcUrl(network: string): string {
  switch (network) {
    case 'solana':
      return process.env.SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com';
    case 'solana-devnet':
      return process.env.SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com';
    case 'solana-testnet':
      return process.env.SOLANA_TESTNET_RPC || 'https://api.testnet.solana.com';
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}

/**
 * Helper to create x402 payment payload (for testing/SDK)
 * SPEC COMPLIANT - Supports both direct RPC and gasless flows
 */
export function createPaymentPayload(params: {
  signature?: string;
  unsigned_transaction?: string;
  from: string;
  to: string;
  amount: string;
  mint?: string;
  network?: string;
}): string {
  const payload: PaymentPayload = {
    x402Version: X402_SPEC_VERSION,
    scheme: 'exact',
    network: params.network || 'solana-devnet',
    payload: {
      signature: params.signature,
      unsigned_transaction: params.unsigned_transaction,
      from: params.from,
      to: params.to,
      amount: params.amount,
      mint: params.mint,
      timestamp: Date.now(),
    },
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
