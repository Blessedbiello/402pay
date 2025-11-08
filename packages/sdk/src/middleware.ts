/**
 * Express middleware for 402pay
 */

import { Request, Response, NextFunction } from 'express';
import {
  PaymentRequirement,
  PaymentProof,
  HTTP_STATUS,
  ERROR_CODES,
  isExpired,
} from '@402pay/shared';
import { SolPay402 } from './client';

export interface MiddlewareConfig {
  price: number;
  currency?: string;
  resource: string;
  paymentScheme?: string;
  expiresIn?: number;
}

/**
 * Create Express middleware for x402 payment protection
 */
export function createPaymentMiddleware(
  solpay: SolPay402,
  config: MiddlewareConfig
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check for payment proof in X-PAYMENT header (x402 standard)
      const xPaymentHeader = req.headers['x-payment'];

      if (!xPaymentHeader) {
        // No payment proof provided, return 402 with payment requirement
        const requirement = await solpay.createPaymentRequirement({
          amount: config.price,
          currency: (config.currency as any) || 'USDC',
          recipient: process.env.RECIPIENT_WALLET || '',
          resource: config.resource,
          expiresIn: config.expiresIn,
        });

        return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
          error: 'Payment Required',
          requirement,
        });
      }

      // Parse payment proof from X-PAYMENT header
      let proof: PaymentProof;
      try {
        // X-PAYMENT header can be base64 encoded or JSON string
        const headerValue = typeof xPaymentHeader === 'string' ? xPaymentHeader : xPaymentHeader[0];

        // Try to decode as base64 first
        let decodedValue: string;
        try {
          decodedValue = Buffer.from(headerValue, 'base64').toString('utf-8');
        } catch {
          // If not base64, treat as plain JSON
          decodedValue = headerValue;
        }

        proof = JSON.parse(decodedValue);
      } catch {
        return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
          error: 'Invalid payment proof format',
          code: ERROR_CODES.INVALID_PAYMENT,
        });
      }

      // Verify payment
      const isValid = await solpay.verifyPayment(proof);

      if (!isValid) {
        return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
          error: 'Invalid payment',
          code: ERROR_CODES.INVALID_PAYMENT,
        });
      }

      // Check amount
      if (proof.amount < config.price) {
        return res.status(HTTP_STATUS.PAYMENT_REQUIRED).json({
          error: 'Insufficient payment amount',
          code: ERROR_CODES.INSUFFICIENT_AMOUNT,
        });
      }

      // Payment is valid, proceed to the endpoint
      // Add X-PAYMENT-RESPONSE header (x402 standard)
      res.setHeader(
        'X-PAYMENT-RESPONSE',
        Buffer.from(
          JSON.stringify({
            verified: true,
            timestamp: Date.now(),
            transactionId: proof.transactionId,
          })
        ).toString('base64')
      );

      next();
    } catch (error) {
      console.error('Payment middleware error:', error);
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error',
      });
    }
  };
}
