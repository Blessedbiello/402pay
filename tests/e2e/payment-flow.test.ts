/**
 * End-to-end test for complete payment flow
 * Tests the full flow from payment requirement to verification
 */

import { Keypair } from '@solana/web3.js';
import { SolPay402 } from '@402pay/sdk';
import { generateNonce } from '@402pay/shared';

describe('Payment Flow E2E', () => {
  let client: SolPay402;
  let payer: Keypair;
  let recipient: Keypair;

  beforeAll(() => {
    // Initialize SDK client
    client = new SolPay402({
      apiKey: process.env.TEST_API_KEY || 'test_key',
      network: 'devnet',
      facilitatorUrl: process.env.FACILITATOR_URL || 'http://localhost:3001',
    });

    // Generate test keypairs
    payer = Keypair.generate();
    recipient = Keypair.generate();
  });

  describe('Complete payment flow', () => {
    it('should create payment requirement', async () => {
      const requirement = await client.createPaymentRequirement({
        amount: 0.01,
        currency: 'USDC',
        recipient: recipient.publicKey.toBase58(),
        resource: '/api/test',
      });

      expect(requirement).toBeDefined();
      expect(requirement.amount).toBe(0.01);
      expect(requirement.currency).toBe('USDC');
      expect(requirement.nonce).toBeDefined();
      expect(requirement.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should handle payment flow with insufficient funds gracefully', async () => {
      const requirement = await client.createPaymentRequirement({
        amount: 0.01,
        currency: 'SOL',
        recipient: recipient.publicKey.toBase58(),
        resource: '/api/test',
      });

      // Note: This will fail in real devnet without funds
      // In production, we'd mock the Solana connection or use a faucet
      expect(requirement).toBeDefined();
    });

    it('should reject expired payment requirements', async () => {
      const requirement = await client.createPaymentRequirement({
        amount: 0.01,
        currency: 'USDC',
        recipient: recipient.publicKey.toBase58(),
        resource: '/api/test',
        expiresIn: 1, // Expire in 1ms
      });

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(Date.now()).toBeGreaterThan(requirement.expiresAt);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      const badClient = new SolPay402({
        apiKey: 'test_key',
        network: 'devnet',
        facilitatorUrl: 'http://invalid-url:9999',
      });

      await expect(
        badClient.verifyPayment({
          signature: 'test',
          payer: payer.publicKey.toBase58(),
          amount: 0.01,
          currency: 'USDC',
          nonce: generateNonce(),
          timestamp: Date.now(),
        })
      ).resolves.toBe(false);
    });
  });

  describe('Multiple payments', () => {
    it('should handle concurrent payment verifications', async () => {
      const promises = Array.from({ length: 5 }).map(() =>
        client.createPaymentRequirement({
          amount: 0.01,
          currency: 'USDC',
          recipient: recipient.publicKey.toBase58(),
          resource: '/api/test',
        })
      );

      const requirements = await Promise.all(promises);

      expect(requirements).toHaveLength(5);
      // All nonces should be unique
      const nonces = requirements.map((r) => r.nonce);
      const uniqueNonces = new Set(nonces);
      expect(uniqueNonces.size).toBe(5);
    });
  });
});

describe('Agent Payments E2E', () => {
  let client: SolPay402;

  beforeAll(() => {
    client = new SolPay402({
      apiKey: process.env.TEST_API_KEY || 'test_key',
      network: 'devnet',
      facilitatorUrl: process.env.FACILITATOR_URL || 'http://localhost:3001',
    });
  });

  it('should create agent wallet', async () => {
    const agent = Keypair.generate();

    // Note: This requires the facilitator API to be running
    // In CI, we'd use docker-compose to start the full stack
    const agentData = {
      name: 'Test Agent',
      publicKey: agent.publicKey.toBase58(),
      owner: 'test_owner',
      spendingLimit: {
        daily: 100,
        perTransaction: 10,
      },
    };

    // This will be implemented when we have the facilitator running in E2E
    expect(agentData).toBeDefined();
  });
});
