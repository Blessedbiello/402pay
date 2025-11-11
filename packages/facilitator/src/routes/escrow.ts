/**
 * Escrow Routes for AgentForce Marketplace
 * Handles secure payment holding and release for jobs
 */

import { Router } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { Connection } from '@solana/web3.js';

const router = Router();

// In-memory escrow storage (replace with Prisma in production)
interface Escrow {
  id: string;
  jobId: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  payer: string;
  recipient: string;
  status: 'created' | 'funded' | 'released' | 'refunded' | 'disputed';
  escrowWallet: string;
  escrowSecretKey: string; // Base64 encoded (DEMO ONLY - use PDA in production)
  transactionId?: string;
  releaseTransactionId?: string;
  createdAt: number;
  updatedAt: number;
}

const escrows = new Map<string, Escrow>();

// Solana connection for demo
const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

// Validation schemas
const createEscrowSchema = z.object({
  jobId: z.string(),
  amount: z.number().positive(),
  currency: z.enum(['SOL', 'USDC']),
  payer: z.string(),
  recipient: z.string(),
  escrowWallet: z.string(),
  escrowSecretKey: z.string(),
  transactionId: z.string().optional(),
  status: z.enum(['created', 'funded']).default('created'),
});

/**
 * Create a new escrow account
 * POST /escrow
 */
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = createEscrowSchema.parse(req.body);

    const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    const escrow: Escrow = {
      id: escrowId,
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    escrows.set(escrowId, escrow);

    logger.info('Escrow created', {
      escrowId,
      jobId: data.jobId,
      amount: data.amount,
      payer: data.payer,
    });

    res.status(201).json(escrow);
  } catch (error) {
    logger.error('Create escrow error', { error });
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create escrow' });
  }
});

/**
 * Get escrow by ID
 * GET /escrow/:id
 */
router.get('/:id', (req: AuthRequest, res) => {
  const escrow = escrows.get(req.params.id);

  if (!escrow) {
    return res.status(404).json({ error: 'Escrow not found' });
  }

  // Don't expose secret key in response
  const { escrowSecretKey, ...safeEscrow } = escrow;

  res.json(safeEscrow);
});

/**
 * Get escrow by job ID
 * GET /escrow/job/:jobId
 */
router.get('/job/:jobId', (req: AuthRequest, res) => {
  const escrow = Array.from(escrows.values()).find((e) => e.jobId === req.params.jobId);

  if (!escrow) {
    return res.status(404).json({ error: 'Escrow not found for job' });
  }

  const { escrowSecretKey, ...safeEscrow } = escrow;

  res.json(safeEscrow);
});

/**
 * Release escrow funds to recipient
 * POST /escrow/:id/release
 */
router.post('/:id/release', async (req: AuthRequest, res) => {
  try {
    const escrow = escrows.get(req.params.id);

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (escrow.status === 'released') {
      return res.status(400).json({ error: 'Escrow already released' });
    }

    if (escrow.status !== 'funded') {
      return res.status(400).json({ error: 'Escrow not funded' });
    }

    const { recipient } = req.body;

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient required' });
    }

    // Transfer funds from escrow wallet to recipient
    try {
      const escrowKeypair = Keypair.fromSecretKey(
        Buffer.from(escrow.escrowSecretKey, 'base64')
      );

      const recipientPubkey = new PublicKey(recipient);

      if (escrow.currency === 'SOL') {
        const lamports = Math.floor(escrow.amount * 1e9);

        // Get balance to ensure we have enough
        const balance = await connection.getBalance(escrowKeypair.publicKey);

        // Leave small amount for rent (0.001 SOL = 1000000 lamports)
        const rentExempt = 1000000;
        const transferAmount = Math.min(lamports, balance - rentExempt);

        if (transferAmount <= 0) {
          throw new Error('Insufficient escrow balance');
        }

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: escrowKeypair.publicKey,
            toPubkey: recipientPubkey,
            lamports: transferAmount,
          })
        );

        const signature = await connection.sendTransaction(transaction, [escrowKeypair]);
        await connection.confirmTransaction(signature, 'confirmed');

        // Update escrow status
        escrow.status = 'released';
        escrow.releaseTransactionId = signature;
        escrow.updatedAt = Date.now();

        logger.info('Escrow released', {
          escrowId: escrow.id,
          jobId: escrow.jobId,
          recipient,
          signature,
        });

        res.json({
          success: true,
          signature,
          escrowId: escrow.id,
        });
      } else {
        // SPL token transfer (simplified for demo)
        return res.status(501).json({ error: 'SPL token escrow not implemented in demo' });
      }
    } catch (error) {
      logger.error('Escrow release transaction failed', { error, escrowId: escrow.id });
      return res.status(500).json({ error: 'Failed to release funds', details: error instanceof Error ? error.message : String(error) });
    }
  } catch (error) {
    logger.error('Release escrow error', { error });
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

/**
 * Refund escrow funds to payer
 * POST /escrow/:id/refund
 */
router.post('/:id/refund', async (req: AuthRequest, res) => {
  try {
    const escrow = escrows.get(req.params.id);

    if (!escrow) {
      return res.status(404).json({ error: 'Escrow not found' });
    }

    if (escrow.status === 'refunded') {
      return res.status(400).json({ error: 'Escrow already refunded' });
    }

    if (escrow.status !== 'funded' && escrow.status !== 'disputed') {
      return res.status(400).json({ error: 'Escrow cannot be refunded' });
    }

    const { payer } = req.body;

    if (!payer) {
      return res.status(400).json({ error: 'Payer required' });
    }

    // Transfer funds from escrow wallet back to payer
    try {
      const escrowKeypair = Keypair.fromSecretKey(
        Buffer.from(escrow.escrowSecretKey, 'base64')
      );

      const payerPubkey = new PublicKey(payer);

      if (escrow.currency === 'SOL') {
        const lamports = Math.floor(escrow.amount * 1e9);

        const balance = await connection.getBalance(escrowKeypair.publicKey);
        const rentExempt = 1000000;
        const transferAmount = Math.min(lamports, balance - rentExempt);

        if (transferAmount <= 0) {
          throw new Error('Insufficient escrow balance');
        }

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: escrowKeypair.publicKey,
            toPubkey: payerPubkey,
            lamports: transferAmount,
          })
        );

        const signature = await connection.sendTransaction(transaction, [escrowKeypair]);
        await connection.confirmTransaction(signature, 'confirmed');

        escrow.status = 'refunded';
        escrow.releaseTransactionId = signature;
        escrow.updatedAt = Date.now();

        logger.info('Escrow refunded', {
          escrowId: escrow.id,
          jobId: escrow.jobId,
          payer,
          signature,
        });

        res.json({
          success: true,
          signature,
          escrowId: escrow.id,
        });
      } else {
        return res.status(501).json({ error: 'SPL token escrow not implemented in demo' });
      }
    } catch (error) {
      logger.error('Escrow refund transaction failed', { error, escrowId: escrow.id });
      return res.status(500).json({ error: 'Failed to refund', details: error instanceof Error ? error.message : String(error) });
    }
  } catch (error) {
    logger.error('Refund escrow error', { error });
    res.status(500).json({ error: 'Failed to refund escrow' });
  }
});

/**
 * List all escrows (for admin/monitoring)
 * GET /escrow
 */
router.get('/', (req: AuthRequest, res) => {
  const { status, limit = 100 } = req.query;

  let allEscrows = Array.from(escrows.values());

  if (status) {
    allEscrows = allEscrows.filter((e) => e.status === status);
  }

  // Sort by created date descending
  allEscrows.sort((a, b) => b.createdAt - a.createdAt);

  // Limit results
  const limitedEscrows = allEscrows.slice(0, parseInt(limit as string));

  // Remove secret keys
  const safeEscrows = limitedEscrows.map(({ escrowSecretKey, ...escrow }) => escrow);

  res.json({
    escrows: safeEscrows,
    total: allEscrows.length,
  });
});

export { router as escrowRouter };
