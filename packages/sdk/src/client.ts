/**
 * Main 402pay SDK Client
 */

import { Connection, PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { sign } from 'tweetnacl';
import bs58 from 'bs58';
import {
  Network,
  TokenType,
  PaymentRequirement,
  PaymentProof,
  DEFAULT_RPC_ENDPOINTS,
  TOKEN_MINTS,
  toTokenAmount,
  generateNonce,
} from '@402pay/shared';
import { SubscriptionManager } from './subscriptions';
import { AgentManager } from './agents';
import { EscrowManager } from './escrow';

export interface SolPay402Config {
  apiKey: string;
  network?: Network;
  rpcUrl?: string;
  facilitatorUrl?: string;
}

export class SolPay402 {
  private apiKey: string;
  private network: Network;
  private connection: Connection;
  private facilitatorUrl: string;

  // Public manager instances for subscriptions, agents, and escrow
  public subscriptions: SubscriptionManager;
  public agents: AgentManager;
  public escrow: EscrowManager;

  constructor(config: SolPay402Config) {
    this.apiKey = config.apiKey;
    this.network = config.network || 'devnet';
    this.facilitatorUrl = config.facilitatorUrl || 'http://localhost:3001';

    const rpcUrl = config.rpcUrl || DEFAULT_RPC_ENDPOINTS[this.network];
    this.connection = new Connection(rpcUrl, 'confirmed');

    // Initialize managers
    this.subscriptions = new SubscriptionManager(this, this.facilitatorUrl, this.apiKey);
    this.agents = new AgentManager(this, this.facilitatorUrl, this.apiKey);
    this.escrow = new EscrowManager(this, this.facilitatorUrl, this.apiKey);
  }

  /**
   * Create a payment requirement for an API endpoint
   */
  async createPaymentRequirement(params: {
    amount: number;
    currency: TokenType;
    recipient: string;
    resource: string;
    expiresIn?: number; // milliseconds
  }): Promise<PaymentRequirement> {
    const { amount, currency, recipient, resource, expiresIn = 5 * 60 * 1000 } = params;

    const requirement: PaymentRequirement = {
      amount,
      currency,
      recipient,
      resource,
      nonce: generateNonce(),
      expiresAt: Date.now() + expiresIn,
      scheme: 'exact',
    };

    return requirement;
  }

  /**
   * Create and send a payment transaction
   */
  async pay(params: {
    requirement: PaymentRequirement;
    payer: Keypair;
  }): Promise<PaymentProof> {
    const { requirement, payer } = params;

    const recipientPubkey = new PublicKey(requirement.recipient);
    const tokenAmount = toTokenAmount(requirement.amount, requirement.currency);

    let signature: string;

    if (requirement.currency === 'SOL') {
      // Native SOL transfer
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: payer.publicKey,
          toPubkey: recipientPubkey,
          lamports: Number(tokenAmount),
        })
      );

      signature = await this.connection.sendTransaction(transaction, [payer]);
    } else {
      // SPL token transfer
      const mintAddress = new PublicKey(TOKEN_MINTS[requirement.currency][this.network]);

      const fromTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        payer.publicKey
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        recipientPubkey
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          payer.publicKey,
          Number(tokenAmount),
          [],
          TOKEN_PROGRAM_ID
        )
      );

      signature = await this.connection.sendTransaction(transaction, [payer]);
    }

    // Wait for confirmation
    await this.connection.confirmTransaction(signature, 'confirmed');

    // Sign the nonce with the payer's secret key
    const nonceBuffer = Buffer.from(requirement.nonce);
    const signatureBytes = sign.detached(nonceBuffer, payer.secretKey);

    const proof: PaymentProof = {
      signature: bs58.encode(signatureBytes),
      payer: payer.publicKey.toBase58(),
      amount: requirement.amount,
      currency: requirement.currency,
      nonce: requirement.nonce,
      timestamp: Date.now(),
      transactionId: signature,
    };

    return proof;
  }

  /**
   * Verify a payment proof
   */
  async verifyPayment(proof: PaymentProof): Promise<boolean> {
    try {
      const response = await fetch(`${this.facilitatorUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(proof),
      });

      if (!response.ok) {
        return false;
      }

      const result = (await response.json()) as { valid: boolean };
      return result.valid === true;
    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  /**
   * Get connection instance for direct Solana interactions
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get current network
   */
  getNetwork(): Network {
    return this.network;
  }
}
