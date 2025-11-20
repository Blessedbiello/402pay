/**
 * Payment verification routes
 */

import { Router } from 'express';
import { Connection, PublicKey, ParsedInstruction } from '@solana/web3.js';
import { z } from 'zod';
import {
  PaymentProof,
  DEFAULT_RPC_ENDPOINTS,
  Network,
  HTTP_STATUS,
  ERROR_CODES,
  isExpired,
  PAYMENT_PROOF_EXPIRY_MS,
  TOKEN_MINTS,
  TOKEN_DECIMALS,
  TokenType,
} from '@402pay/shared';
import * as nacl from 'tweetnacl';
import bs58 from 'bs58';
import { redisClient } from '../utils/redis';
import { logger } from '../utils/logger';
import {
  recordPaymentVerification,
  recordBlockchainRequest,
  paymentVerificationDuration,
} from '../utils/metrics';

const router = Router();

// Initialize Solana connection
const network = (process.env.SOLANA_NETWORK || 'devnet') as Network;
const rpcUrl = process.env.SOLANA_RPC_URL || DEFAULT_RPC_ENDPOINTS[network];
const connection = new Connection(rpcUrl, 'confirmed');

// Fallback in-memory nonce tracking (if Redis unavailable)
const usedNonces = new Set<string>();

// Clean up old nonces periodically (every hour)
setInterval(() => {
  if (usedNonces.size > 10000) {
    usedNonces.clear();
  }
}, 60 * 60 * 1000);

/**
 * Verify a payment proof
 * POST /verify
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const proof = PaymentProof.parse(req.body);

    const startTime = Date.now();

    // Check if nonce has been used (replay attack prevention)
    // Try Redis first, fallback to in-memory
    const nonceUsed = redisClient.isAvailable()
      ? await redisClient.hasNonce(proof.nonce)
      : usedNonces.has(proof.nonce);

    if (nonceUsed) {
      recordPaymentVerification('replay', proof.currency);
      return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
        valid: false,
        error: 'Nonce has already been used',
        code: ERROR_CODES.REPLAY_ATTACK,
      });
    }

    // Check if payment is expired
    if (Date.now() - proof.timestamp > PAYMENT_PROOF_EXPIRY_MS) {
      recordPaymentVerification('expired', proof.currency);
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

        // Verify transaction details match proof
        const validationResult = await validateTransactionDetails(tx, proof);
        if (!validationResult.valid) {
          return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
            valid: false,
            error: validationResult.error,
            code: validationResult.code,
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

    // Mark nonce as used (in Redis or in-memory)
    if (redisClient.isAvailable()) {
      await redisClient.setNonce(proof.nonce, 900); // 15 minutes TTL
    } else {
      usedNonces.add(proof.nonce);
    }

    // Record metrics
    const duration = (Date.now() - startTime) / 1000;
    recordPaymentVerification('success', proof.currency, proof.amount, duration);

    logger.info('Payment verified successfully', {
      payer: proof.payer,
      amount: proof.amount,
      currency: proof.currency,
      transactionId: proof.transactionId,
    });

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

/**
 * Validate transaction details match the payment proof
 */
async function validateTransactionDetails(
  tx: any,
  proof: PaymentProof
): Promise<{ valid: boolean; error?: string; code?: string }> {
  try {
    const payerPubkey = new PublicKey(proof.payer);
    const expectedAmount = proof.amount * Math.pow(10, TOKEN_DECIMALS[proof.currency]);

    // For SOL transfers
    if (proof.currency === 'SOL') {
      // Find the transfer instruction
      const preBalance = tx.meta?.preBalances?.[0] || 0;
      const postBalance = tx.meta?.postBalances?.[0] || 0;
      const actualTransferred = preBalance - postBalance;

      // Allow for transaction fees (within 0.01 SOL tolerance)
      const tolerance = 0.01 * 1e9; // 0.01 SOL in lamports
      if (Math.abs(actualTransferred - expectedAmount) > tolerance) {
        return {
          valid: false,
          error: `Amount mismatch: expected ${proof.amount} SOL, got ${actualTransferred / 1e9} SOL`,
          code: ERROR_CODES.AMOUNT_MISMATCH,
        };
      }
    } else {
      // For SPL token transfers, verify the instruction details
      const instructions = tx.transaction?.message?.instructions || [];
      let foundTransfer = false;
      let validatedAmount = false;

      const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

      for (const instruction of instructions) {
        // Check if this is a token transfer instruction
        if (instruction.programId?.toBase58() === TOKEN_PROGRAM_ID) {
          foundTransfer = true;

          // Parse SPL token transfer instruction data
          // SPL Token Transfer instruction format:
          // - Instruction discriminator: 3 (1 byte for Transfer)
          // - Amount: u64 (8 bytes)
          const data = instruction.data;

          if (data && data.length >= 9) {
            // First byte should be 3 (Transfer instruction)
            const instructionType = data[0];

            if (instructionType === 3) {
              // Extract amount (little-endian u64, bytes 1-8)
              const amountBuffer = Buffer.from(data.slice(1, 9));
              const actualAmount = amountBuffer.readBigUInt64LE(0);

              // Verify amount matches proof
              if (Number(actualAmount) === expectedAmount) {
                validatedAmount = true;
              } else {
                return {
                  valid: false,
                  error: `Amount mismatch: expected ${expectedAmount}, got ${actualAmount}`,
                  code: ERROR_CODES.AMOUNT_MISMATCH,
                };
              }

              // Verify accounts in instruction
              // accounts[0]: source token account
              // accounts[1]: destination token account
              // accounts[2]: source owner
              const accounts = instruction.accounts || [];

              if (accounts.length < 2) {
                return {
                  valid: false,
                  error: 'Invalid token transfer instruction structure',
                  code: ERROR_CODES.TRANSACTION_FAILED,
                };
              }

              // Verify payer is the signer
              const signers = tx.transaction?.message?.accountKeys || [];
              const payerFound = signers.some((key: any) =>
                key.toBase58() === proof.payer
              );

              if (!payerFound) {
                return {
                  valid: false,
                  error: 'Payer is not a signer of the transaction',
                  code: ERROR_CODES.INVALID_SIGNATURE,
                };
              }

              break;
            }
          }
        }
      }

      if (!foundTransfer) {
        return {
          valid: false,
          error: 'No token transfer instruction found',
          code: ERROR_CODES.TRANSACTION_FAILED,
        };
      }

      if (!validatedAmount) {
        return {
          valid: false,
          error: 'Token transfer amount could not be validated',
          code: ERROR_CODES.TRANSACTION_FAILED,
        };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('Transaction validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate transaction details',
      code: ERROR_CODES.TRANSACTION_FAILED,
    };
  }
}

export { router as verificationRouter };
