/**
 * Escrow management for agent marketplace jobs
 * Handles secure payment holding and release
 */

import { SolPay402 } from './client';
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TokenType } from '@402pay/shared';

export interface EscrowAccount {
  id: string;
  jobId: string;
  amount: number;
  currency: TokenType;
  payer: string;
  recipient: string;
  status: 'created' | 'funded' | 'released' | 'refunded' | 'disputed';
  escrowWallet: string; // Public key of escrow wallet
  transactionId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateEscrowParams {
  jobId: string;
  amount: number;
  currency: TokenType;
  payer: Keypair; // Client agent wallet
  recipient: string; // Provider agent public key
}

export interface ReleaseEscrowParams {
  escrowId: string;
  recipient: string;
  authority: Keypair; // Escrow authority (facilitator)
}

export class EscrowManager {
  private client: SolPay402;
  private facilitatorUrl: string;
  private apiKey: string;

  constructor(client: SolPay402, facilitatorUrl: string, apiKey: string) {
    this.client = client;
    this.facilitatorUrl = facilitatorUrl;
    this.apiKey = apiKey;
  }

  /**
   * Create an escrow account for a marketplace job
   */
  async createEscrow(params: CreateEscrowParams): Promise<EscrowAccount> {
    const { jobId, amount, currency, payer, recipient } = params;

    // Generate a new keypair for the escrow wallet
    const escrowWallet = Keypair.generate();

    try {
      // Create the escrow account with initial funding
      const signature = await this.fundEscrow({
        escrowWallet: escrowWallet.publicKey.toBase58(),
        amount,
        currency,
        payer,
      });

      // Register escrow with facilitator
      const response = await fetch(`${this.facilitatorUrl}/escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          jobId,
          amount,
          currency,
          payer: payer.publicKey.toBase58(),
          recipient,
          escrowWallet: escrowWallet.publicKey.toBase58(),
          escrowSecretKey: Buffer.from(escrowWallet.secretKey).toString('base64'),
          transactionId: signature,
          status: 'funded',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register escrow: ${response.statusText}`);
      }

      const escrow = (await response.json()) as EscrowAccount;
      return escrow;
    } catch (error) {
      console.error('Failed to create escrow:', error);
      throw error;
    }
  }

  /**
   * Fund an escrow wallet with tokens
   */
  private async fundEscrow(params: {
    escrowWallet: string;
    amount: number;
    currency: TokenType;
    payer: Keypair;
  }): Promise<string> {
    const { escrowWallet, amount, currency, payer } = params;

    const connection = this.client.getConnection();
    const escrowPubkey = new PublicKey(escrowWallet);

    // For simplicity in demo, transfer SOL to escrow wallet
    // In production, would use PDA (Program Derived Address) and smart contract
    if (currency === 'SOL') {
      const lamports = amount * 1e9; // Convert SOL to lamports

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: escrowPubkey,
          lamports,
        })
      );

      const signature = await connection.sendTransaction(transaction, [payer]);
      await connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } else {
      // For USDC/other tokens, would use token transfer
      // Simplified for demo - in production use proper SPL token escrow
      throw new Error('SPL token escrow not yet implemented in demo');
    }
  }

  /**
   * Release funds from escrow to recipient
   */
  async releaseEscrow(params: {
    escrowId: string;
    recipient: string;
  }): Promise<{ signature: string }> {
    try {
      // Call facilitator to release escrow
      const response = await fetch(
        `${this.facilitatorUrl}/escrow/${params.escrowId}/release`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({
            recipient: params.recipient,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to release escrow: ${response.statusText}`);
      }

      const result = (await response.json()) as { signature: string };
      return result;
    } catch (error) {
      console.error('Failed to release escrow:', error);
      throw error;
    }
  }

  /**
   * Refund escrowed funds to payer
   */
  async refundEscrow(params: {
    escrowId: string;
    payer: string;
  }): Promise<{ signature: string }> {
    try {
      const response = await fetch(
        `${this.facilitatorUrl}/escrow/${params.escrowId}/refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
          },
          body: JSON.stringify({
            payer: params.payer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to refund escrow: ${response.statusText}`);
      }

      const result = (await response.json()) as { signature: string };
      return result;
    } catch (error) {
      console.error('Failed to refund escrow:', error);
      throw error;
    }
  }

  /**
   * Get escrow details
   */
  async getEscrow(escrowId: string): Promise<EscrowAccount> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/escrow/${escrowId}`, {
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get escrow: ${response.statusText}`);
      }

      return (await response.json()) as EscrowAccount;
    } catch (error) {
      console.error('Failed to get escrow:', error);
      throw error;
    }
  }

  /**
   * Get escrow by job ID
   */
  async getEscrowByJobId(jobId: string): Promise<EscrowAccount | null> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/escrow/job/${jobId}`, {
        headers: {
          'x-api-key': this.apiKey,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get escrow by job ID: ${response.statusText}`);
      }

      return (await response.json()) as EscrowAccount;
    } catch (error) {
      console.error('Failed to get escrow by job ID:', error);
      throw error;
    }
  }

  /**
   * List all escrows (for admin/monitoring)
   */
  async listEscrows(params?: {
    status?: EscrowAccount['status'];
    limit?: number;
  }): Promise<EscrowAccount[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(
        `${this.facilitatorUrl}/escrow?${queryParams.toString()}`,
        {
          headers: {
            'x-api-key': this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list escrows: ${response.statusText}`);
      }

      const result = (await response.json()) as { escrows?: EscrowAccount[] };
      return result.escrows || [];
    } catch (error) {
      console.error('Failed to list escrows:', error);
      throw error;
    }
  }
}
