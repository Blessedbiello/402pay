/**
 * x402 Protocol Facilitator Service with Kora Integration
 *
 * This is a gasless facilitator that uses Kora RPC to:
 * - Validate transactions without submitting (POST /verify)
 * - Sign and send transactions on behalf of users (POST /settle)
 * - Advertise Kora's fee payer address (GET /supported)
 *
 * **Key Difference from Direct RPC Facilitator:**
 * - Users don't need SOL for gas fees
 * - Users can pay in USDC or other SPL tokens
 * - Kora signs as the fee payer and submits to Solana
 *
 * Based on: https://github.com/solana-foundation/kora
 */

import { Router } from 'express';
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
  KoraClient,
  createKoraClientFromEnv,
  KoraRPCError,
} from '@402pay/shared';
import { logger } from '../utils/logger';

const router = Router();

// Initialize Kora client from environment variables
const koraClient = createKoraClientFromEnv();

// Cache for Kora's payer address
let koraPayerAddress: string | null = null;

/**
 * Initialize Kora payer address (call on startup)
 */
async function initializeKoraPayerAddress() {
  try {
    const payerInfo = await koraClient.getPayerSigner();
    koraPayerAddress = payerInfo.address || payerInfo.pubkey || '';
    logger.info('Kora payer address initialized', { address: koraPayerAddress });
  } catch (error) {
    logger.error('Failed to get Kora payer address', { error });
    koraPayerAddress = '';
  }
}

// Initialize on module load
initializeKoraPayerAddress();

/**
 * POST /verify
 *
 * Validates payment without executing it on-chain.
 * Uses Kora's signTransaction with validate_only=true.
 *
 * **Flow:**
 * 1. Decode payment header
 * 2. Extract unsigned transaction
 * 3. Call Kora to validate
 * 4. Return validation result
 *
 * Request Body: VerifyRequest
 * Response: VerifyResponse
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

    // Check x402 version
    if (verifyRequest.x402Version !== X402_SPEC_VERSION) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Unsupported x402 version: ${verifyRequest.x402Version}. Expected: ${X402_SPEC_VERSION}`,
      };
      return res.json(response);
    }

    // Decode payment payload
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

    // Verify Solana payment data
    if (!isSolanaPaymentData(paymentPayload.payload)) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'Invalid Solana payment data structure',
      };
      return res.json(response);
    }

    const solanaData = paymentPayload.payload as SolanaPaymentData;

    // Extract unsigned transaction
    if (!solanaData.unsigned_transaction) {
      const response: VerifyResponse = {
        isValid: false,
        invalidReason: 'Missing unsigned_transaction in payment payload. Kora facilitator requires unsigned transactions.',
      };
      return res.json(response);
    }

    // Validate with Kora (doesn't submit to chain)
    try {
      const koraResult = await koraClient.validateTransaction(solanaData.unsigned_transaction);

      if (!koraResult.success || koraResult.valid !== true) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: koraResult.error || koraResult.validation_error || 'Transaction validation failed',
        };
        return res.json(response);
      }

      // Additional spec-compliant checks
      const requirements = verifyRequest.paymentRequirements;

      // Verify network
      if (paymentPayload.network !== requirements.network) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Network mismatch: expected ${requirements.network}, got ${paymentPayload.network}`,
        };
        return res.json(response);
      }

      // Verify amount
      const expectedAmount = BigInt(requirements.maxAmountRequired);
      const actualAmount = BigInt(solanaData.amount);

      if (actualAmount < expectedAmount) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Insufficient amount: expected at least ${expectedAmount}, got ${actualAmount}`,
        };
        return res.json(response);
      }

      // Verify recipient
      if (solanaData.to !== requirements.payTo) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Recipient mismatch: expected ${requirements.payTo}, got ${solanaData.to}`,
        };
        return res.json(response);
      }

      // All checks passed
      const duration = Date.now() - startTime;
      logger.info('Kora payment verified successfully', {
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
      logger.error('Kora verification error', { error: error.message });

      if (error instanceof KoraRPCError) {
        const response: VerifyResponse = {
          isValid: false,
          invalidReason: `Kora RPC error: ${error.message} (code: ${error.code})`,
        };
        return res.json(response);
      }

      const response: VerifyResponse = {
        isValid: false,
        invalidReason: `Verification failed: ${error.message}`,
      };
      return res.json(response);
    }

  } catch (error: any) {
    logger.error('x402-kora /verify endpoint error', { error: error.message });
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
 * Executes payment settlement on-chain using Kora.
 * Kora signs as the fee payer and submits the transaction.
 *
 * **Flow:**
 * 1. Decode payment header
 * 2. Extract unsigned transaction
 * 3. Call Kora to sign and send
 * 4. Return transaction signature
 *
 * Request Body: SettleRequest
 * Response: SettleResponse
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

    // Decode payment payload
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

    // Extract unsigned transaction
    if (!solanaData.unsigned_transaction) {
      const response: SettleResponse = {
        success: false,
        error: 'Missing unsigned_transaction in payment payload',
        txHash: '',
        networkId: '',
      };
      return res.json(response);
    }

    // Sign and send with Kora (gasless for user!)
    try {
      const koraResult = await koraClient.signAndSendTransaction(solanaData.unsigned_transaction, {
        skip_preflight: false,
        preflight_commitment: 'confirmed',
      });

      if (!koraResult.success || !koraResult.signature) {
        const response: SettleResponse = {
          success: false,
          error: koraResult.error || 'Settlement failed',
          txHash: '',
          networkId: paymentPayload.network,
        };
        return res.json(response);
      }

      const duration = Date.now() - startTime;
      logger.info('Kora payment settled successfully', {
        signature: koraResult.signature,
        from: solanaData.from,
        to: solanaData.to,
        amount: solanaData.amount,
        network: paymentPayload.network,
        duration: `${duration}ms`,
        gaslessPayer: koraPayerAddress,
      });

      // Settlement successful
      const response: SettleResponse = {
        success: true,
        txHash: koraResult.signature,
        networkId: paymentPayload.network,
        payer: solanaData.from,
      };
      return res.json(response);

    } catch (error: any) {
      logger.error('Kora settlement error', { error: error.message });

      if (error instanceof KoraRPCError) {
        const response: SettleResponse = {
          success: false,
          error: `Kora RPC error: ${error.message} (code: ${error.code})`,
          txHash: '',
          networkId: paymentPayload.network,
        };
        return res.json(response);
      }

      const response: SettleResponse = {
        success: false,
        error: `Settlement failed: ${error.message}`,
        txHash: '',
        networkId: paymentPayload.network,
      };
      return res.json(response);
    }

  } catch (error: any) {
    logger.error('x402-kora /settle endpoint error', { error: error.message });
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
 * Includes Kora's fee payer address to show who pays gas fees.
 *
 * Response: SupportedResponse
 */
router.get('/supported', async (req, res) => {
  try {
    // Refresh payer address if not cached
    if (!koraPayerAddress) {
      await initializeKoraPayerAddress();
    }

    const supportedKinds: SupportedKind[] = [
      {
        x402Version: X402_SPEC_VERSION,
        scheme: X402PaymentScheme.EXACT,
        network: X402Network.SOLANA_DEVNET,
        feePayer: koraPayerAddress || undefined,
      },
    ];

    // Add mainnet if configured
    if (process.env.KORA_MAINNET_ENABLED === 'true') {
      supportedKinds.push({
        x402Version: X402_SPEC_VERSION,
        scheme: X402PaymentScheme.EXACT,
        network: X402Network.SOLANA,
        feePayer: koraPayerAddress || undefined,
      });
    }

    const response: SupportedResponse = {
      kinds: supportedKinds,
    };

    logger.info('x402-kora /supported queried', {
      count: supportedKinds.length,
      feePayer: koraPayerAddress,
    });

    res.json(response);

  } catch (error: any) {
    logger.error('x402-kora /supported error', { error: error.message });

    // Return empty response on error
    const response: SupportedResponse = {
      kinds: [],
    };
    res.json(response);
  }
});

/**
 * GET /health
 *
 * Health check for x402 Kora facilitator service
 * Also checks Kora RPC connectivity
 */
router.get('/health', async (req, res) => {
  try {
    // Check Kora connectivity
    const koraHealth = await koraClient.health();

    res.json({
      status: koraHealth.status === 'ok' ? 'ok' : 'degraded',
      service: 'x402-kora-facilitator',
      version: X402_SPEC_VERSION,
      timestamp: Date.now(),
      kora: {
        status: koraHealth.status,
        url: process.env.KORA_RPC_URL || 'http://localhost:8080',
        payerAddress: koraPayerAddress,
      },
    });
  } catch (error: any) {
    logger.error('Health check failed', { error: error.message });

    res.status(503).json({
      status: 'error',
      service: 'x402-kora-facilitator',
      version: X402_SPEC_VERSION,
      timestamp: Date.now(),
      error: error.message,
    });
  }
});

export { router as x402KoraFacilitatorRouter };
