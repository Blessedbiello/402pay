/**
 * x402 Protocol Facilitator Service
 *
 * Official spec-compliant implementation based on:
 * https://github.com/coinbase/x402
 *
 * Provides three required endpoints:
 * - POST /verify - Validate payment without settlement
 * - POST /settle - Execute on-chain payment settlement
 * - GET /supported - List supported (scheme, network) combinations
 */

import { Router } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  VerifyRequest,
  VerifyResponse,
  SettleRequest,
  SettleResponse,
  SupportedResponse,
  SupportedKind,
  PaymentPayload,
  SolanaPaymentData,
  isSolanaPaymentData,
  X402_SPEC_VERSION,
  X402PaymentScheme,
  X402Network,
  DEFAULT_RPC_ENDPOINTS,
  Network,
} from '@402pay/shared';
import { logger } from '../utils/logger';
import { redisClient } from '../utils/redis';

const router = Router();

// Initialize Solana connection
const network = (process.env.SOLANA_NETWORK || 'devnet') as Network;
const rpcUrl = process.env.SOLANA_RPC_URL || DEFAULT_RPC_ENDPOINTS[network];
const connection = new Connection(rpcUrl, 'confirmed');

// Fallback in-memory cache for settled transactions
const settledTransactions = new Set<string>();

/**
 * POST /verify
 *
 * Validates payment without executing it on-chain.
 * Used by servers to check if payment is valid before proceeding.
 *
 * Request Body: VerifyRequest
 * {
 *   x402Version: number,
 *   paymentHeader: string (base64-encoded PaymentPayload),
 *   paymentRequirements: PaymentRequirements
 * }
 *
 * Response: VerifyResponse
 * {
 *   isValid: boolean,
 *   invalidReason?: string,
 *   payer?: string
 * }
 */
router.post('/verify', async (req, res) => {
  const startTime = Date.now();

  try {
    const verifyRequest = req.body as VerifyRequest;

    // Validate request structure
    if (!verifyRequest.x402Version || !verifyRequest.paymentHeader || !verifyRequest.paymentRequirements) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'Missing required fields: x402Version, paymentHeader, or paymentRequirements',
      };
      return res.status(400).json(response);
    }

    // Check x402 version compatibility
    if (verifyRequest.x402Version !== X402_SPEC_VERSION) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Unsupported x402 version: ${verifyRequest.x402Version}. Expected: ${X402_SPEC_VERSION}`,
      };
      return res.json(response);
    }

    // Decode payment payload from base64
    let paymentPayload: PaymentPayload;
    try {
      const payloadJson = Buffer.from(verifyRequest.paymentHeader, 'base64').toString('utf-8');
      paymentPayload = JSON.parse(payloadJson);
    } catch (error) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'Invalid paymentHeader: failed to decode base64 or parse JSON',
      };
      return res.json(response);
    }

    // Validate payload structure
    if (!paymentPayload.x402Version || !paymentPayload.scheme || !paymentPayload.network || !paymentPayload.payload) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'Invalid PaymentPayload structure',
      };
      return res.json(response);
    }

    // Verify scheme and network match requirements
    const requirements = verifyRequest.paymentRequirements;
    if (paymentPayload.scheme !== requirements.scheme) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Scheme mismatch: expected ${requirements.scheme}, got ${paymentPayload.scheme}`,
      };
      return res.json(response);
    }

    if (paymentPayload.network !== requirements.network) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Network mismatch: expected ${requirements.network}, got ${paymentPayload.network}`,
      };
      return res.json(response);
    }

    // Verify Solana payment data
    if (!isSolanaPaymentData(paymentPayload.payload)) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'Invalid Solana payment data structure',
      };
      return res.json(response);
    }

    const solanaData = paymentPayload.payload as SolanaPaymentData;

    // Validate signature is present (required for direct RPC facilitator)
    if (!solanaData.signature) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'Missing signature. This facilitator requires a transaction signature (direct RPC flow). For gasless transactions, use the Kora facilitator endpoint.',
      };
      return res.json(response);
    }

    // Verify transaction exists on-chain
    try {
      const tx = await connection.getTransaction(solanaData.signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.meta) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: 'Transaction not found on Solana blockchain',
        };
        return res.json(response);
      }

      // Verify transaction was successful
      if (tx.meta.err) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Transaction failed: ${JSON.stringify(tx.meta.err)}`,
        };
        return res.json(response);
      }

      // Verify sender (from) matches transaction
      const accountKeys = tx.transaction.message.getAccountKeys();
      const txSender = accountKeys.get(0)?.toBase58();
      if (txSender !== solanaData.from) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Sender mismatch: transaction sender is ${txSender}, but payment claims ${solanaData.from}`,
        };
        return res.json(response);
      }

      // Verify recipient (to) matches requirements
      if (solanaData.to !== requirements.payTo) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Recipient mismatch: expected ${requirements.payTo}, got ${solanaData.to}`,
        };
        return res.json(response);
      }

      // Verify amount (convert to lamports for SOL or smallest token units)
      const expectedAmount = BigInt(requirements.maxAmountRequired);
      const actualAmount = BigInt(solanaData.amount);

      if (actualAmount < expectedAmount) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Insufficient amount: expected at least ${expectedAmount}, got ${actualAmount}`,
        };
        return res.json(response);
      }

      // Verify timeout (check transaction timestamp)
      const blockTime = tx.blockTime;
      if (blockTime) {
        const txTimestampMs = blockTime * 1000;
        const now = Date.now();
        const maxTimeoutMs = requirements.maxTimeoutSeconds * 1000;

        if (now - txTimestampMs > maxTimeoutMs) {
          const response: VerifyResponse = {
            isValid: false,
            invalidReason: `Payment expired: transaction is ${Math.floor((now - txTimestampMs) / 1000)}s old, max timeout is ${requirements.maxTimeoutSeconds}s`,
          };
          return res.json(response);
        }
      }

      // All checks passed
      const duration = Date.now() - startTime;
      logger.info('x402 payment verified successfully', {
        signature: solanaData.signature,
        from: solanaData.from,
        to: solanaData.to,
        amount: solanaData.amount,
        network: paymentPayload.network,
        duration: `${duration}ms`,
      });

      const response: VerifyResponse = {
        isValid: true,
        payer: solanaData.from,
      };
      return res.json(response);

    } catch (error: any) {
      logger.error('x402 verification error', { error: error.message });
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Blockchain verification failed: ${error.message}`,
      };
      return res.json(response);
    }

  } catch (error: any) {
    logger.error('x402 /verify endpoint error', { error: error.message });
    const response: VerifyResponse = {
      isValid: false,
      invalidReason: 'Internal server error during verification',
    };
    return res.status(500).json(response);
  }
});

/**
 * POST /settle
 *
 * Executes payment settlement on-chain.
 * In Solana's case, the transaction is already on-chain (sent by client),
 * so this endpoint verifies the transaction and marks it as settled.
 *
 * For other networks (e.g., EVM with meta-transactions), this would
 * actually submit the transaction to the blockchain.
 *
 * Request Body: SettleRequest
 * {
 *   x402Version: number,
 *   paymentHeader: string (base64-encoded PaymentPayload),
 *   paymentRequirements: PaymentRequirements
 * }
 *
 * Response: SettleResponse
 * {
 *   success: boolean,
 *   error?: string,
 *   txHash: string,
 *   networkId: string,
 *   payer?: string
 * }
 */
router.post('/settle', async (req, res) => {
  const startTime = Date.now();

  try {
    const settleRequest = req.body as SettleRequest;

    // Validate request structure
    if (!settleRequest.x402Version || !settleRequest.paymentHeader || !settleRequest.paymentRequirements) {
      const response: SettleResponse = {
        success: false,
        error: 'Missing required fields: x402Version, paymentHeader, or paymentRequirements',
        txHash: '',
        networkId: '',
      };
      return res.status(400).json(response);
    }

    // First, verify the payment
    const verifyRequest: VerifyRequest = {
      x402Version: settleRequest.x402Version,
      paymentHeader: settleRequest.paymentHeader,
      paymentRequirements: settleRequest.paymentRequirements,
    };

    // Decode payment payload to get signature
    let paymentPayload: PaymentPayload;
    try {
      const payloadJson = Buffer.from(settleRequest.paymentHeader, 'base64').toString('utf-8');
      paymentPayload = JSON.parse(payloadJson);
    } catch (error) {
      const response: SettleResponse = {
        success: false,
        error: 'Invalid paymentHeader: failed to decode base64 or parse JSON',
        txHash: '',
        networkId: '',
      };
      return res.json(response);
    }

    if (!isSolanaPaymentData(paymentPayload.payload)) {
      const response: SettleResponse = {
        success: false,
        error: 'Invalid Solana payment data structure',
        txHash: '',
        networkId: '',
      };
      return res.json(response);
    }

    const solanaData = paymentPayload.payload as SolanaPaymentData;

    // Validate signature is present (required for direct RPC facilitator)
    if (!solanaData.signature) {
      const response: SettleResponse = {
        success: false,
        error: 'Missing signature. This facilitator requires a transaction signature (direct RPC flow). For gasless transactions, use the Kora facilitator endpoint.',
        txHash: '',
        networkId: paymentPayload.network,
        payer: solanaData.from,
      };
      return res.json(response);
    }

    const signature = solanaData.signature;

    // Check if already settled (prevent double-spending)
    const alreadySettled = redisClient.isAvailable()
      ? await redisClient.hasNonce(`settled:${signature}`)
      : settledTransactions.has(signature);

    if (alreadySettled) {
      const response: SettleResponse = {
        success: false,
        error: 'Transaction already settled',
        txHash: signature,
        networkId: paymentPayload.network,
        payer: solanaData.from,
      };
      return res.json(response);
    }

    // Perform verification (reuse verify logic)
    try {
      const tx = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!tx || !tx.meta) {
        const response: SettleResponse = {
          success: false,
          error: 'Transaction not found on blockchain',
          txHash: signature,
          networkId: paymentPayload.network,
        };
        return res.json(response);
      }

      if (tx.meta.err) {
        const response: SettleResponse = {
          success: false,
          error: `Transaction failed: ${JSON.stringify(tx.meta.err)}`,
          txHash: signature,
          networkId: paymentPayload.network,
        };
        return res.json(response);
      }

      // Verify all requirements (simplified - could call /verify internally)
      const requirements = settleRequest.paymentRequirements;

      // Verify recipient
      if (solanaData.to !== requirements.payTo) {
        const response: SettleResponse = {
          success: false,
          error: `Recipient mismatch: expected ${requirements.payTo}, got ${solanaData.to}`,
          txHash: signature,
          networkId: paymentPayload.network,
        };
        return res.json(response);
      }

      // Verify amount
      const expectedAmount = BigInt(requirements.maxAmountRequired);
      const actualAmount = BigInt(solanaData.amount);

      if (actualAmount < expectedAmount) {
        const response: SettleResponse = {
          success: false,
          error: `Insufficient amount: expected at least ${expectedAmount}, got ${actualAmount}`,
          txHash: signature,
          networkId: paymentPayload.network,
        };
        return res.json(response);
      }

      // Mark as settled
      if (redisClient.isAvailable()) {
        // Store for 24 hours
        await redisClient.setNonce(`settled:${signature}`, 86400);
      } else {
        settledTransactions.add(signature);
      }

      const duration = Date.now() - startTime;
      logger.info('x402 payment settled successfully', {
        signature,
        from: solanaData.from,
        to: solanaData.to,
        amount: solanaData.amount,
        network: paymentPayload.network,
        duration: `${duration}ms`,
      });

      // Settlement successful
      const response: SettleResponse = {
        success: true,
        txHash: signature,
        networkId: paymentPayload.network,
        payer: solanaData.from,
      };
      return res.json(response);

    } catch (error: any) {
      logger.error('x402 settlement error', { error: error.message });
      const response: SettleResponse = {
        success: false,
        error: `Settlement failed: ${error.message}`,
        txHash: signature,
        networkId: paymentPayload.network,
      };
      return res.json(response);
    }

  } catch (error: any) {
    logger.error('x402 /settle endpoint error', { error: error.message });
    const response: SettleResponse = {
      success: false,
      error: 'Internal server error during settlement',
      txHash: '',
      networkId: '',
    };
    return res.status(500).json(response);
  }
});

/**
 * GET /supported
 *
 * Returns list of supported (scheme, network) combinations.
 * Clients can query this to see what payment options are available.
 *
 * Response: SupportedResponse
 * {
 *   kinds: Array<{
 *     x402Version: number,
 *     scheme: string,
 *     network: string
 *   }>
 * }
 */
router.get('/supported', (req, res) => {
  const supportedKinds: SupportedKind[] = [
    {
      x402Version: X402_SPEC_VERSION,
      scheme: X402PaymentScheme.EXACT,
      network: X402Network.SOLANA_DEVNET,
    },
    {
      x402Version: X402_SPEC_VERSION,
      scheme: X402PaymentScheme.EXACT,
      network: X402Network.SOLANA,
    },
  ];

  // Add testnet if configured
  if (process.env.SOLANA_TESTNET_ENABLED === 'true') {
    supportedKinds.push({
      x402Version: X402_SPEC_VERSION,
      scheme: X402PaymentScheme.EXACT,
      network: X402Network.SOLANA_TESTNET,
    });
  }

  const response: SupportedResponse = {
    kinds: supportedKinds,
  };

  logger.info('x402 /supported queried', { count: supportedKinds.length });

  res.json(response);
});

/**
 * GET /health
 *
 * Health check for x402 facilitator service
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'x402-facilitator',
    version: X402_SPEC_VERSION,
    network: network,
    timestamp: Date.now(),
  });
});

export { router as x402FacilitatorRouter };
