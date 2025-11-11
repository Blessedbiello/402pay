/**
 * x402 Protocol Client
 * Helper for making payments to x402-compliant endpoints
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  X402PaymentRequiredResponse,
  X402PaymentPayload,
  X402PaymentResponse,
  X402_HEADERS,
  X402_VERSION,
} from '@402pay/shared';

export interface X402ClientConfig {
  /** Solana RPC URL */
  rpcUrl?: string;

  /** Payer wallet (Keypair or secret key array) */
  payer: Keypair | Uint8Array;

  /** Network identifier */
  network?: string;
}

export class X402Client {
  private connection: Connection;
  private payer: Keypair;
  private network: string;

  constructor(config: X402ClientConfig) {
    this.connection = new Connection(
      config.rpcUrl || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Handle both Keypair and secret key array
    this.payer =
      config.payer instanceof Keypair
        ? config.payer
        : Keypair.fromSecretKey(
            config.payer instanceof Uint8Array ? config.payer : new Uint8Array(config.payer)
          );

    this.network = config.network || 'solana-devnet';
  }

  /**
   * Make a paid request to an x402-compliant endpoint
   *
   * Automatically handles:
   * 1. Initial 402 response
   * 2. Payment creation on Solana
   * 3. Retry with payment header
   *
   * @example
   * ```typescript
   * const client = new X402Client({
   *   payer: myWallet,
   *   rpcUrl: 'https://api.devnet.solana.com'
   * });
   *
   * const response = await client.paidRequest('https://api.example.com/premium-data');
   * console.log(response.data); // Premium data
   * ```
   */
  async paidRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<{
    data: any;
    payment: {
      signature: string;
      amount: string;
      from: string;
      to: string;
    };
    response: X402PaymentResponse;
  }> {
    // Step 1: Make initial request without payment
    const initialResponse = await fetch(url, options);

    if (initialResponse.status !== 402) {
      // Not a paid endpoint, return regular response
      const data = await initialResponse.json();
      return {
        data,
        payment: {
          signature: '',
          amount: '0',
          from: this.payer.publicKey.toBase58(),
          to: '',
        },
        response: {
          success: true,
        },
      };
    }

    // Step 2: Parse payment requirements
    const paymentRequired = (await initialResponse.json()) as X402PaymentRequiredResponse;

    if (!paymentRequired.paymentRequirements || paymentRequired.paymentRequirements.length === 0) {
      throw new Error('No payment requirements specified in 402 response');
    }

    // Use first payment requirement (could be enhanced to choose best option)
    const requirement = paymentRequired.paymentRequirements[0];

    // Verify network matches
    if (requirement.network !== this.network) {
      throw new Error(
        `Network mismatch: endpoint requires ${requirement.network}, client configured for ${this.network}`
      );
    }

    // Step 3: Create and send payment on Solana
    const paymentResult = await this.makePayment(requirement);

    // Step 4: Create X-PAYMENT header
    const paymentPayload: X402PaymentPayload = {
      x402Version: X402_VERSION,
      scheme: requirement.scheme,
      network: requirement.network,
      payload: {
        signature: paymentResult.signature,
        from: this.payer.publicKey.toBase58(),
        to: requirement.recipient,
        amount: requirement.maxAmountRequired,
        timestamp: Date.now(),
      },
    };

    const paymentHeader = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

    // Step 5: Retry request with payment
    const paidResponse = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        [X402_HEADERS.PAYMENT]: paymentHeader,
      },
    });

    if (!paidResponse.ok) {
      throw new Error(`Payment rejected: ${paidResponse.status} ${paidResponse.statusText}`);
    }

    // Step 6: Parse response and payment confirmation
    const data = await paidResponse.json();
    const paymentResponseHeader = paidResponse.headers.get(X402_HEADERS.PAYMENT_RESPONSE);

    let paymentResponse: X402PaymentResponse = { success: true };
    if (paymentResponseHeader) {
      const decoded = Buffer.from(paymentResponseHeader, 'base64').toString('utf-8');
      paymentResponse = JSON.parse(decoded);
    }

    return {
      data,
      payment: {
        signature: paymentResult.signature,
        amount: requirement.maxAmountRequired,
        from: this.payer.publicKey.toBase58(),
        to: requirement.recipient,
      },
      response: paymentResponse,
    };
  }

  /**
   * Make payment on Solana blockchain
   */
  private async makePayment(requirement: {
    recipient: string;
    maxAmountRequired: string;
    assetAddress?: string;
  }): Promise<{ signature: string }> {
    const recipientPubkey = new PublicKey(requirement.recipient);
    const lamports = BigInt(requirement.maxAmountRequired);

    // TODO: Add support for SPL tokens via assetAddress
    if (requirement.assetAddress) {
      throw new Error('SPL token payments not yet implemented in SDK');
    }

    // Create SOL transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.payer.publicKey,
        toPubkey: recipientPubkey,
        lamports: Number(lamports),
      })
    );

    // Send and confirm transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer],
      {
        commitment: 'confirmed',
      }
    );

    return { signature };
  }

  /**
   * Get payment requirements without making payment
   * Useful for displaying price to user before paying
   */
  async getPaymentRequirements(url: string, options: RequestInit = {}): Promise<{
    requirements: X402PaymentRequiredResponse;
    priceInSOL: number;
    priceInLamports: string;
  }> {
    const response = await fetch(url, options);

    if (response.status !== 402) {
      throw new Error(`Endpoint is not x402-protected (status: ${response.status})`);
    }

    const requirements = (await response.json()) as X402PaymentRequiredResponse;

    // Calculate price (assuming first requirement uses lamports)
    const firstReq = requirements.paymentRequirements[0];
    const lamports = BigInt(firstReq?.maxAmountRequired || '0');
    const sol = Number(lamports) / LAMPORTS_PER_SOL;

    return {
      requirements,
      priceInSOL: sol,
      priceInLamports: firstReq?.maxAmountRequired || '0',
    };
  }

  /**
   * Check if payer has sufficient balance for payment
   */
  async checkBalance(requiredLamports: string): Promise<{
    hasEnough: boolean;
    balance: number;
    required: number;
    shortfall: number;
  }> {
    const balance = await this.connection.getBalance(this.payer.publicKey);
    const required = Number(BigInt(requiredLamports));
    const hasEnough = balance >= required;

    return {
      hasEnough,
      balance,
      required,
      shortfall: hasEnough ? 0 : required - balance,
    };
  }

  /**
   * Get payer public key
   */
  getPublicKey(): PublicKey {
    return this.payer.publicKey;
  }

  /**
   * Get payer balance in SOL
   */
  async getBalance(): Promise<number> {
    const lamports = await this.connection.getBalance(this.payer.publicKey);
    return lamports / LAMPORTS_PER_SOL;
  }
}

/**
 * Helper function to create x402 client from secret key
 */
export function createX402Client(secretKey: Uint8Array | number[], rpcUrl?: string): X402Client {
  return new X402Client({
    payer: secretKey instanceof Uint8Array ? secretKey : new Uint8Array(secretKey),
    rpcUrl,
  });
}

/**
 * Helper to generate test wallet
 */
export function generateTestWallet(): {
  keypair: Keypair;
  publicKey: string;
  secretKey: Uint8Array;
} {
  const keypair = Keypair.generate();
  return {
    keypair,
    publicKey: keypair.publicKey.toBase58(),
    secretKey: keypair.secretKey,
  };
}
