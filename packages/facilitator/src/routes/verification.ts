/**
 * Payment verification routes
 */

import { Router } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';
import { z } from 'zod';
import {
  PaymentProof,
  DEFAULT_RPC_ENDPOINTS,
  Network,
  HTTP_STATUS,
  ERROR_CODES,
  isExpired,
} from '@402pay/shared';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';

const router = Router();

// Initialize Solana connection
const network = (process.env.SOLANA_NETWORK || 'devnet') as Network;
const rpcUrl = process.env.SOLANA_RPC_URL || DEFAULT_RPC_ENDPOINTS[network];
const connection = new Connection(rpcUrl, 'confirmed');

/**
 * Verify a payment proof
 * POST /verify
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const proof = PaymentProof.parse(req.body);

    // Check if payment is expired (15 minute window)
    if (Date.now() - proof.timestamp > 15 * 60 * 1000) {
      return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
        valid: false,
        error: 'Payment proof expired',
        code: ERROR_CODES.PAYMENT_EXPIRED,
      });
    }

    // Verify transaction exists and is confirmed on Solana
    if (proof.transactionId) {
      try {
        const tx = await connection.getTransaction(proof.transactionId, {
          maxSupportedTransactionVersion: 0,
        });

        if (!tx) {
          return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
            valid: false,
            error: 'Transaction not found on blockchain',
            code: ERROR_CODES.TRANSACTION_FAILED,
          });
        }

        // Verify transaction was successful
        if (tx.meta?.err) {
          return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
            valid: false,
            error: 'Transaction failed',
            code: ERROR_CODES.TRANSACTION_FAILED,
          });
        }
      } catch (error) {
        console.error('Transaction verification error:', error);
        return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
          valid: false,
          error: 'Failed to verify transaction',
          code: ERROR_CODES.TRANSACTION_FAILED,
        });
      }
    }

    // Verify signature
    try {
      const payerPublicKey = new PublicKey(proof.payer);
      const message = Buffer.from(proof.nonce);
      const signature = bs58.decode(proof.signature);

      const isValidSignature = nacl.sign.detached.verify(
        message,
        signature,
        payerPublicKey.toBytes()
      );

      if (!isValidSignature) {
        return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
          valid: false,
          error: 'Invalid signature',
          code: ERROR_CODES.INVALID_SIGNATURE,
        });
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
        valid: false,
        error: 'Signature verification failed',
        code: ERROR_CODES.INVALID_SIGNATURE,
      });
    }

    // All checks passed
    res.json({
      valid: true,
      proof,
      verifiedAt: Date.now(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid payment proof format',
        details: error.errors,
      });
    }

    console.error('Verification error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      valid: false,
      error: 'Verification failed',
    });
  }
});

export { router as verificationRouter };
