/**
 * Tests for Express middleware
 */

import express, { Request, Response } from 'express';
import request from 'supertest';
import { createPaymentMiddleware } from '../middleware';
import { SolPay402 } from '../client';

describe('createPaymentMiddleware', () => {
  let app: express.Application;
  let mockClient: SolPay402;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockClient = new SolPay402({
      apiKey: 'test_key',
      network: 'devnet',
      facilitatorUrl: 'http://localhost:3001',
    });

    // Set recipient wallet
    process.env.RECIPIENT_WALLET = 'TestRecipientWallet123456789012345678';
  });

  describe('Request without payment', () => {
    it('should return 402 when no X-PAYMENT header', async () => {
      app.get(
        '/api/protected',
        createPaymentMiddleware(mockClient, {
          price: 0.01,
          resource: '/api/protected',
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'protected content' });
        }
      );

      const response = await request(app)
        .get('/api/protected')
        .expect(402);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('requirement');
      expect(response.body.requirement).toHaveProperty('amount', 0.01);
      expect(response.body.requirement).toHaveProperty('currency', 'USDC');
    });

    it('should include payment requirement in 402 response', async () => {
      app.get(
        '/api/data',
        createPaymentMiddleware(mockClient, {
          price: 0.05,
          resource: '/api/data',
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'test' });
        }
      );

      const response = await request(app).get('/api/data');

      expect(response.status).toBe(402);
      expect(response.body.requirement).toMatchObject({
        amount: 0.05,
        currency: 'USDC',
        resource: '/api/data',
      });
      expect(response.body.requirement).toHaveProperty('nonce');
      expect(response.body.requirement).toHaveProperty('expiresAt');
    });
  });

  describe('Request with payment', () => {
    it('should parse base64 encoded X-PAYMENT header', async () => {
      const mockProof = {
        signature: 'test_sig',
        payer: 'TestPayer123456789012345678901234',
        amount: 0.01,
        currency: 'USDC',
        nonce: 'test_nonce',
        timestamp: Date.now(),
        transactionId: 'test_tx',
      };

      // Mock the verifyPayment method to return true
      jest.spyOn(mockClient, 'verifyPayment').mockResolvedValue(true);

      app.get(
        '/api/protected',
        createPaymentMiddleware(mockClient, {
          price: 0.01,
          resource: '/api/protected',
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'protected content' });
        }
      );

      const base64Proof = Buffer.from(JSON.stringify(mockProof)).toString('base64');

      const response = await request(app)
        .get('/api/protected')
        .set('X-PAYMENT', base64Proof)
        .expect(200);

      expect(response.body).toEqual({ data: 'protected content' });
      expect(response.headers['x-payment-response']).toBeDefined();
    });

    it('should reject insufficient payment amount', async () => {
      const mockProof = {
        signature: 'test_sig',
        payer: 'TestPayer123456789012345678901234',
        amount: 0.005, // Less than required
        currency: 'USDC',
        nonce: 'test_nonce',
        timestamp: Date.now(),
        transactionId: 'test_tx',
      };

      jest.spyOn(mockClient, 'verifyPayment').mockResolvedValue(true);

      app.get(
        '/api/protected',
        createPaymentMiddleware(mockClient, {
          price: 0.01, // Requires 0.01
          resource: '/api/protected',
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'protected content' });
        }
      );

      const base64Proof = Buffer.from(JSON.stringify(mockProof)).toString('base64');

      const response = await request(app)
        .get('/api/protected')
        .set('X-PAYMENT', base64Proof)
        .expect(402);

      expect(response.body.code).toBe('INSUFFICIENT_AMOUNT');
    });

    it('should reject invalid payment proof', async () => {
      jest.spyOn(mockClient, 'verifyPayment').mockResolvedValue(false);

      app.get(
        '/api/protected',
        createPaymentMiddleware(mockClient, {
          price: 0.01,
          resource: '/api/protected',
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'protected content' });
        }
      );

      const mockProof = {
        signature: 'invalid_sig',
        payer: 'TestPayer123456789012345678901234',
        amount: 0.01,
        currency: 'USDC',
        nonce: 'test_nonce',
        timestamp: Date.now(),
      };

      const base64Proof = Buffer.from(JSON.stringify(mockProof)).toString('base64');

      const response = await request(app)
        .get('/api/protected')
        .set('X-PAYMENT', base64Proof)
        .expect(402);

      expect(response.body).toHaveProperty('error');
      expect(response.body.code).toBe('INVALID_PAYMENT');
    });

    it('should handle malformed X-PAYMENT header', async () => {
      app.get(
        '/api/protected',
        createPaymentMiddleware(mockClient, {
          price: 0.01,
          resource: '/api/protected',
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'protected content' });
        }
      );

      const response = await request(app)
        .get('/api/protected')
        .set('X-PAYMENT', 'invalid_base64')
        .expect(402);

      expect(response.body.code).toBe('INVALID_PAYMENT');
    });
  });

  describe('Configuration options', () => {
    it('should support different currencies', async () => {
      app.get(
        '/api/sol-endpoint',
        createPaymentMiddleware(mockClient, {
          price: 0.1,
          currency: 'SOL',
          resource: '/api/sol-endpoint',
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'content' });
        }
      );

      const response = await request(app).get('/api/sol-endpoint');

      expect(response.body.requirement.currency).toBe('SOL');
      expect(response.body.requirement.amount).toBe(0.1);
    });

    it('should support custom expiration time', async () => {
      app.get(
        '/api/custom-expiry',
        createPaymentMiddleware(mockClient, {
          price: 0.01,
          resource: '/api/custom-expiry',
          expiresIn: 10 * 60 * 1000, // 10 minutes
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'content' });
        }
      );

      const response = await request(app).get('/api/custom-expiry');

      const requirement = response.body.requirement;
      const expectedExpiry = Date.now() + 10 * 60 * 1000;

      expect(requirement.expiresAt).toBeGreaterThan(Date.now());
      expect(requirement.expiresAt).toBeLessThanOrEqual(expectedExpiry + 1000);
    });
  });

  describe('X-PAYMENT-RESPONSE header', () => {
    it('should include verification details in response header', async () => {
      const mockProof = {
        signature: 'test_sig',
        payer: 'TestPayer123456789012345678901234',
        amount: 0.01,
        currency: 'USDC',
        nonce: 'test_nonce',
        timestamp: Date.now(),
        transactionId: 'test_tx_123',
      };

      jest.spyOn(mockClient, 'verifyPayment').mockResolvedValue(true);

      app.get(
        '/api/protected',
        createPaymentMiddleware(mockClient, {
          price: 0.01,
          resource: '/api/protected',
        }),
        (req: Request, res: Response) => {
          res.json({ data: 'protected content' });
        }
      );

      const base64Proof = Buffer.from(JSON.stringify(mockProof)).toString('base64');

      const response = await request(app)
        .get('/api/protected')
        .set('X-PAYMENT', base64Proof)
        .expect(200);

      const paymentResponse = JSON.parse(
        Buffer.from(response.headers['x-payment-response'], 'base64').toString('utf-8')
      );

      expect(paymentResponse).toHaveProperty('verified', true);
      expect(paymentResponse).toHaveProperty('timestamp');
      expect(paymentResponse).toHaveProperty('transactionId', 'test_tx_123');
    });
  });
});
