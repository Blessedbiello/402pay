/**
 * x402 Protocol Middleware
 * Implements HTTP 402 Payment Required standard
 */

import { Request, Response, NextFunction } from 'express';
import {
  X402PaymentRequirement,
  X402PaymentRequiredResponse,
  X402PaymentPayload,
  X402PaymentResponse,
  X402_VERSION,
  X402_HEADERS,
  X402_STATUS,
  X402ErrorCode,
} from '@402pay/shared';
import { Connection, PublicKey } from '@solana/web3.js';
import { logger } from '../utils/logger';

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');

export interface X402Request extends Request {
  x402Payment?: X402PaymentPayload;
  x402Verified?: boolean;
}

/**
 * x402 Configuration for a protected route
 */
export interface X402Config {
  /** Amount required in lamports (for SOL) or token smallest units */
  amount: string;

  /** Recipient wallet address */
  recipient: string;

  /** Resource description */
  description: string;

  /** Network (solana, solana-devnet, etc.) */
  network?: string;

  /** Token mint address (optional, omit for native SOL) */
  assetAddress?: string;

  /** MIME type of resource */
  mimeType?: string;

  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Create x402 middleware for a protected route
 *
 * Usage:
 * ```typescript
 * app.get('/api/premium-data',
 *   x402Middleware({
 *     amount: '1000000', // 0.001 SOL (1M lamports)
 *     recipient: 'YOUR_WALLET_ADDRESS',
 *     description: 'Premium data access',
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
      const paymentHeader = req.headers[X402_HEADERS.PAYMENT.toLowerCase()] as string;

      if (!paymentHeader) {
        // No payment provided - return 402 with payment requirements
        return send402Response(req, res, config);
      }

      // Parse and verify payment
      const verification = await verifyPayment(paymentHeader, config, req);

      if (!verification.isValid) {
        // Invalid payment - return 402 with error
        return send402Response(req, res, config, {
          code: X402ErrorCode.INVALID_PAYMENT,
          message: verification.invalidReason || 'Payment verification failed',
        });
      }

      // Payment verified - attach to request and continue
      req.x402Payment = verification.payment;
      req.x402Verified = true;

      // Add payment response header
      const paymentResponse: X402PaymentResponse = {
        success: true,
        transactionHash: verification.payment?.payload.signature,
        network: config.network || 'solana-devnet',
        resource: {
          id: req.path,
          type: config.mimeType || 'application/json',
        },
      };

      res.setHeader(
        X402_HEADERS.PAYMENT_RESPONSE,
        Buffer.from(JSON.stringify(paymentResponse)).toString('base64')
      );

      next();
    } catch (error) {
      logger.error('x402 middleware error', { error });
      res.status(X402_STATUS.BAD_REQUEST).json({
        error: 'Payment processing error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}

/**
 * Send HTTP 402 Payment Required response
 */
function send402Response(
  req: Request,
  res: Response,
  config: X402Config,
  error?: { code: string; message: string }
) {
  const paymentRequirement: X402PaymentRequirement = {
    scheme: 'exact',
    network: config.network || 'solana-devnet',
    maxAmountRequired: config.amount,
    recipient: config.recipient,
    resource: req.path,
    description: config.description,
    mimeType: config.mimeType || 'application/json',
    assetAddress: config.assetAddress,
    timeout: config.timeout || 60000, // 60 seconds default
  };

  const response: X402PaymentRequiredResponse = {
    x402Version: X402_VERSION,
    paymentRequirements: [paymentRequirement],
    ...(error && { error }),
  };

  res.status(X402_STATUS.PAYMENT_REQUIRED).json(response);
}

/**
 * Verify payment from X-PAYMENT header
 */
async function verifyPayment(
  paymentHeader: string,
  config: X402Config,
  req: Request
): Promise<{
  isValid: boolean;
  invalidReason?: string;
  payment?: X402PaymentPayload;
}> {
  try {
    // Decode base64 payment payload
    const payloadJson = Buffer.from(paymentHeader, 'base64').toString('utf-8');
    const payment: X402PaymentPayload = JSON.parse(payloadJson);

    // Verify x402 version
    if (payment.x402Version !== X402_VERSION) {
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

    // Verify amount
    const paidAmount = BigInt(payment.payload.amount);
    const requiredAmount = BigInt(config.amount);
    if (paidAmount < requiredAmount) {
      return {
        isValid: false,
        invalidReason: `Insufficient amount. Required ${requiredAmount}, got ${paidAmount}`,
      };
    }

    // Verify recipient
    if (payment.payload.to !== config.recipient) {
      return {
        isValid: false,
        invalidReason: `Recipient mismatch. Expected ${config.recipient}, got ${payment.payload.to}`,
      };
    }

    // Verify token (if specified)
    if (config.assetAddress) {
      if (payment.payload.mint !== config.assetAddress) {
        return {
          isValid: false,
          invalidReason: `Token mismatch. Expected ${config.assetAddress}, got ${payment.payload.mint}`,
        };
      }
    }

    // Verify transaction on Solana blockchain
    const isOnChain = await verifyTransactionOnChain(
      payment.payload.signature,
      payment.network
    );

    if (!isOnChain) {
      return {
        isValid: false,
        invalidReason: 'Transaction not found on blockchain or not confirmed',
      };
    }

    // Check timeout
    if (config.timeout) {
      const age = Date.now() - payment.payload.timestamp;
      if (age > config.timeout) {
        return {
          isValid: false,
          invalidReason: `Payment expired. Timeout: ${config.timeout}ms, Age: ${age}ms`,
        };
      }
    }

    logger.info('x402 payment verified', {
      signature: payment.payload.signature,
      from: payment.payload.from,
      to: payment.payload.to,
      amount: payment.payload.amount,
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
 */
export function createPaymentPayload(params: {
  signature: string;
  from: string;
  to: string;
  amount: string;
  mint?: string;
  network?: string;
}): string {
  const payload: X402PaymentPayload = {
    x402Version: X402_VERSION,
    scheme: 'exact',
    network: params.network || 'solana-devnet',
    payload: {
      signature: params.signature,
      from: params.from,
      to: params.to,
      amount: params.amount,
      mint: params.mint,
      timestamp: Date.now(),
    },
  };

  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
