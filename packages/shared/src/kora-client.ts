/**
 * Kora RPC Client
 *
 * TypeScript client for interacting with Kora gasless signing service.
 *
 * Usage:
 * ```typescript
 * const kora = new KoraClient('http://localhost:8080', 'your-api-key');
 *
 * // Validate transaction
 * const validation = await kora.validateTransaction(unsignedTx);
 *
 * // Sign and send transaction (gasless for user!)
 * const result = await kora.signAndSendTransaction(unsignedTx);
 * ```
 */

import {
  KoraClientConfig,
  KoraRPCRequest,
  KoraRPCResponse,
  KoraSignTransactionRequest,
  KoraSignTransactionResponse,
  KoraSignAndSendTransactionRequest,
  KoraSignAndSendTransactionResponse,
  KoraGetPayerSignerResponse,
  KoraHealthResponse,
  isKoraError,
} from './kora-types';

export class KoraClient {
  private rpcUrl: string;
  private apiKey: string;
  private timeout: number;
  private requestId: number;

  constructor(
    rpcUrl: string = 'http://localhost:8080',
    apiKey: string = '',
    config?: Partial<KoraClientConfig>
  ) {
    this.rpcUrl = rpcUrl;
    this.apiKey = apiKey;
    this.timeout = config?.timeout || 30000;
    this.requestId = 1;
  }

  /**
   * Validate transaction without signing or sending
   *
   * Use this in the /verify endpoint to check if a transaction is valid
   * before actually submitting it to the network.
   *
   * @param transaction - Base64-encoded unsigned transaction
   * @returns Validation result
   */
  async validateTransaction(transaction: string): Promise<KoraSignTransactionResponse> {
    const request: KoraSignTransactionRequest = {
      transaction,
      validate_only: true,
    };

    const response = await this.rpcCall<KoraSignTransactionResponse>(
      'signTransaction',
      request
    );

    return response;
  }

  /**
   * Sign transaction without sending
   *
   * Returns the signed transaction for inspection or later broadcast.
   *
   * @param transaction - Base64-encoded unsigned transaction
   * @returns Signed transaction
   */
  async signTransaction(transaction: string): Promise<KoraSignTransactionResponse> {
    const request: KoraSignTransactionRequest = {
      transaction,
      validate_only: false,
    };

    return this.rpcCall<KoraSignTransactionResponse>('signTransaction', request);
  }

  /**
   * Sign and send transaction to Solana (gasless!)
   *
   * Use this in the /settle endpoint to execute the payment.
   * Kora will sign as the fee payer and submit to Solana.
   *
   * @param transaction - Base64-encoded unsigned transaction
   * @param options - Transaction options
   * @returns Transaction signature
   */
  async signAndSendTransaction(
    transaction: string,
    options?: KoraSignAndSendTransactionRequest['options']
  ): Promise<KoraSignAndSendTransactionResponse> {
    const request: KoraSignAndSendTransactionRequest = {
      transaction,
      options,
    };

    return this.rpcCall<KoraSignAndSendTransactionResponse>(
      'signAndSendTransaction',
      request
    );
  }

  /**
   * Get Kora's fee payer address
   *
   * Use this in the /supported endpoint to advertise who pays gas fees.
   *
   * @returns Kora's public key address
   */
  async getPayerSigner(): Promise<KoraGetPayerSignerResponse> {
    return this.rpcCall<KoraGetPayerSignerResponse>('getPayerSigner', {});
  }

  /**
   * Health check
   *
   * @returns Health status
   */
  async health(): Promise<KoraHealthResponse> {
    try {
      const response = await fetch(`${this.rpcUrl}/health`, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return { status: 'error' };
      }

      return (await response.json()) as KoraHealthResponse;
    } catch (error) {
      return { status: 'error' };
    }
  }

  /**
   * Generic JSON-RPC call to Kora
   */
  private async rpcCall<T>(method: string, params: any): Promise<T> {
    const requestBody: KoraRPCRequest = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Kora RPC HTTP error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as KoraRPCResponse<T>;

      if (isKoraError(data)) {
        throw new KoraRPCError(
          data.error.message,
          data.error.code,
          data.error.data
        );
      }

      if (!data.result) {
        throw new Error('Kora RPC response missing result field');
      }

      return data.result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof KoraRPCError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Kora RPC timeout after ${this.timeout}ms`);
        }
        throw new Error(`Kora RPC error: ${error.message}`);
      }

      throw new Error('Unknown Kora RPC error');
    }
  }

  /**
   * Build HTTP headers for requests
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }
}

/**
 * Custom error class for Kora RPC errors
 */
export class KoraRPCError extends Error {
  constructor(
    message: string,
    public code: number,
    public data?: any
  ) {
    super(message);
    this.name = 'KoraRPCError';
  }
}

/**
 * Helper to create a Kora client from environment variables
 */
export function createKoraClientFromEnv(): KoraClient {
  const rpcUrl = process.env.KORA_RPC_URL || 'http://localhost:8080';
  const apiKey = process.env.KORA_API_KEY || '';

  if (!apiKey && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  KORA_API_KEY not set. Kora RPC may reject requests.');
  }

  return new KoraClient(rpcUrl, apiKey);
}
