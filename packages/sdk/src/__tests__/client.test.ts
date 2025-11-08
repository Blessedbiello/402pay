/**
 * Tests for SolPay402 SDK Client
 */

import { SolPay402 } from '../client';
import { Keypair } from '@solana/web3.js';
import { generateNonce, TokenType } from '@402pay/shared';

describe('SolPay402', () => {
  let client: SolPay402;

  beforeEach(() => {
    client = new SolPay402({
      apiKey: 'test_api_key',
      network: 'devnet',
      facilitatorUrl: 'http://localhost:3001',
    });
  });

  describe('Constructor', () => {
    it('should initialize with provided config', () => {
      expect(client).toBeDefined();
      expect(client.getNetwork()).toBe('devnet');
    });

    it('should use default values when not provided', () => {
      const defaultClient = new SolPay402({
        apiKey: 'test_key',
      });

      expect(defaultClient.getNetwork()).toBe('devnet');
    });

    it('should initialize managers', () => {
      expect(client.subscriptions).toBeDefined();
      expect(client.agents).toBeDefined();
    });
  });

  describe('createPaymentRequirement', () => {
    it('should create valid payment requirement', async () => {
      const requirement = await client.createPaymentRequirement({
        amount: 0.01,
        currency: 'USDC',
        recipient: 'TestRecipientPublicKey12345678901234',
        resource: '/api/test',
      });

      expect(requirement).toHaveProperty('amount', 0.01);
      expect(requirement).toHaveProperty('currency', 'USDC');
      expect(requirement).toHaveProperty('recipient');
      expect(requirement).toHaveProperty('resource', '/api/test');
      expect(requirement).toHaveProperty('nonce');
      expect(requirement).toHaveProperty('expiresAt');
      expect(requirement).toHaveProperty('scheme', 'exact');
    });

    it('should generate unique nonce', async () => {
      const req1 = await client.createPaymentRequirement({
        amount: 0.01,
        currency: 'USDC',
        recipient: 'test',
        resource: '/api/test',
      });

      const req2 = await client.createPaymentRequirement({
        amount: 0.01,
        currency: 'USDC',
        recipient: 'test',
        resource: '/api/test',
      });

      expect(req1.nonce).not.toBe(req2.nonce);
    });

    it('should set expiration time', async () => {
      const requirement = await client.createPaymentRequirement({
        amount: 0.01,
        currency: 'USDC',
        recipient: 'test',
        resource: '/api/test',
        expiresIn: 10 * 60 * 1000, // 10 minutes
      });

      const expectedExpiry = Date.now() + 10 * 60 * 1000;
      expect(requirement.expiresAt).toBeGreaterThan(Date.now());
      expect(requirement.expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000); // 1 second tolerance
    });

    it('should use default expiration when not provided', async () => {
      const requirement = await client.createPaymentRequirement({
        amount: 0.01,
        currency: 'USDC',
        recipient: 'test',
        resource: '/api/test',
      });

      const expectedExpiry = Date.now() + 5 * 60 * 1000; // Default 5 minutes
      expect(requirement.expiresAt).toBeGreaterThan(Date.now());
      expect(requirement.expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000);
    });
  });

  describe('getConnection', () => {
    it('should return Solana connection instance', () => {
      const connection = client.getConnection();
      expect(connection).toBeDefined();
      expect(connection.rpcEndpoint).toContain('devnet');
    });
  });

  describe('getNetwork', () => {
    it('should return configured network', () => {
      expect(client.getNetwork()).toBe('devnet');
    });

    it('should return correct network for different configs', () => {
      const mainnetClient = new SolPay402({
        apiKey: 'test',
        network: 'mainnet-beta',
      });

      expect(mainnetClient.getNetwork()).toBe('mainnet-beta');
    });
  });

  describe('Payment Flow', () => {
    it('should validate payment requirement structure', async () => {
      const requirement = await client.createPaymentRequirement({
        amount: 0.05,
        currency: 'SOL',
        recipient: Keypair.generate().publicKey.toBase58(),
        resource: '/api/premium',
      });

      // Validate all required fields
      expect(requirement.amount).toBe(0.05);
      expect(requirement.currency).toBe('SOL');
      expect(requirement.recipient).toBeTruthy();
      expect(requirement.resource).toBe('/api/premium');
      expect(requirement.nonce).toBeTruthy();
      expect(requirement.expiresAt).toBeGreaterThan(Date.now());
      expect(requirement.scheme).toBe('exact');
    });

    it('should accept different token types', async () => {
      const currencies: TokenType[] = ['USDC', 'USDT', 'SOL', 'PYUSD'];

      for (const currency of currencies) {
        const requirement = await client.createPaymentRequirement({
          amount: 1.0,
          currency,
          recipient: 'test',
          resource: '/api/test',
        });

        expect(requirement.currency).toBe(currency);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid network gracefully', () => {
      expect(() => {
        new SolPay402({
          apiKey: 'test',
          network: 'invalid' as any,
        });
      }).toThrow();
    });
  });
});

describe('SolPay402 Integration', () => {
  it('should have consistent configuration across managers', () => {
    const client = new SolPay402({
      apiKey: 'test_key',
      network: 'mainnet-beta',
      facilitatorUrl: 'https://api.example.com',
    });

    expect(client.getNetwork()).toBe('mainnet-beta');
    // Managers should use the same client instance
    expect(client.subscriptions).toBeDefined();
    expect(client.agents).toBeDefined();
  });
});
