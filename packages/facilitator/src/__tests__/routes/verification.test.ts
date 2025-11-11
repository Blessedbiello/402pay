/**
 * Tests for payment verification route
 */

import request from 'supertest';
import { app } from '../../index';
import { PaymentProof, ERROR_CODES } from '@402pay/shared';

describe('POST /verify', () => {
  const validProof: PaymentProof = {
    signature: 'test_signature_base58',
    payer: 'TestPublicKey123456789012345678901234',
    amount: 0.01,
    currency: 'USDC',
    nonce: 'test_nonce_' + Date.now(),
    timestamp: Date.now(),
    transactionId: 'test_tx_id',
  };

  describe('Request Validation', () => {
    it('should reject request with missing fields', async () => {
      const response = await request(app)
        .post('/verify')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('valid', false);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with invalid amount', async () => {
      const invalidProof = { ...validProof, amount: -1 };

      const response = await request(app)
        .post('/verify')
        .send(invalidProof)
        .expect(400);

      expect(response.body.valid).toBe(false);
    });

    it('should reject request with invalid currency', async () => {
      const invalidProof = { ...validProof, currency: 'INVALID' };

      const response = await request(app)
        .post('/verify')
        .send(invalidProof)
        .expect(400);

      expect(response.body.valid).toBe(false);
    });
  });

  describe('Expiration Validation', () => {
    it('should reject expired payment proof', async () => {
      const expiredProof = {
        ...validProof,
        timestamp: Date.now() - 20 * 60 * 1000, // 20 minutes ago
        nonce: 'expired_nonce_' + Date.now(),
      };

      const response = await request(app)
        .post('/verify')
        .send(expiredProof)
        .expect(402);

      expect(response.body).toHaveProperty('valid', false);
      expect(response.body.code).toBe(ERROR_CODES.PAYMENT_EXPIRED);
    });

    it('should accept recent payment proof', async () => {
      const recentProof = {
        ...validProof,
        timestamp: Date.now() - 1 * 60 * 1000, // 1 minute ago
        nonce: 'recent_nonce_' + Date.now(),
      };

      const response = await request(app)
        .post('/verify')
        .send(recentProof);

      // May fail signature validation but shouldn't fail expiration check
      if (response.body.code) {
        expect(response.body.code).not.toBe(ERROR_CODES.PAYMENT_EXPIRED);
      }
    });
  });

  describe('Replay Attack Prevention', () => {
    it('should reject reused nonce', async () => {
      const proof = {
        ...validProof,
        nonce: 'reused_nonce_' + Date.now(),
      };

      // First request
      await request(app).post('/verify').send(proof);

      // Second request with same nonce
      const response = await request(app)
        .post('/verify')
        .send(proof)
        .expect(402);

      expect(response.body.code).toBe(ERROR_CODES.REPLAY_ATTACK);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = [];

      // Make multiple requests rapidly
      for (let i = 0; i < 120; i++) {
        requests.push(
          request(app)
            .post('/verify')
            .send({ ...validProof, nonce: `rate_limit_test_${i}` })
        );
      }

      const responses = await Promise.all(requests);

      // Some requests should be rate limited (429)
      const rateLimited = responses.filter((res) => res.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Error Responses', () => {
    it('should return proper error structure', async () => {
      const response = await request(app)
        .post('/verify')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('valid');
      expect(response.body).toHaveProperty('error');
    });

    it('should include error code in response', async () => {
      const expiredProof = {
        ...validProof,
        timestamp: Date.now() - 20 * 60 * 1000,
        nonce: 'error_code_test_' + Date.now(),
      };

      const response = await request(app)
        .post('/verify')
        .send(expiredProof);

      expect(response.body).toHaveProperty('code');
      expect(typeof response.body.code).toBe('string');
    });
  });
});

describe('Verification Endpoint Security', () => {
  it('should have security headers', async () => {
    const response = await request(app).get('/health');

    // Helmet should add these headers
    expect(response.headers).toHaveProperty('x-content-type-options');
    expect(response.headers).toHaveProperty('x-frame-options');
  });

  it('should limit request body size', async () => {
    const largePayload = {
      signature: 'x'.repeat(10 * 1024 * 1024), // 10MB
      payer: 'test',
      amount: 1,
      currency: 'USDC',
      nonce: 'test',
      timestamp: Date.now(),
    };

    const response = await request(app)
      .post('/verify')
      .send(largePayload);

    expect(response.status).toBe(413);
  });
});
