# @402pay/sdk

TypeScript SDK for integrating x402 payments on Solana.

## Installation

```bash
npm install @402pay/sdk
```

## Quick Start

### Express API with Payment Protection

```typescript
import express from 'express';
import { SolPay402, createPaymentMiddleware } from '@402pay/sdk';

const app = express();

const solpay = new SolPay402({
  apiKey: process.env.SOLPAY402_API_KEY,
  network: 'devnet',
});

// Protect an endpoint with x402 payment
app.get(
  '/api/premium-data',
  createPaymentMiddleware(solpay, {
    price: 0.01, // 0.01 USDC
    currency: 'USDC',
    resource: '/api/premium-data',
  }),
  (req, res) => {
    res.json({ data: 'Premium content here!' });
  }
);

app.listen(3000);
```

### Subscription Management

```typescript
import { SolPay402 } from '@402pay/sdk';

const solpay = new SolPay402({
  apiKey: process.env.SOLPAY402_API_KEY,
});

// Create a subscription
const subscription = await solpay.subscriptions.create({
  agentId: 'agent_123',
  planId: 'pro_plan',
  walletAddress: 'AgentWalletPublicKey...',
});

// Record usage for metered billing
await solpay.subscriptions.recordUsage({
  subscriptionId: subscription.id,
  quantity: 150, // 150 API calls
  resource: '/api/data',
});

// Cancel subscription
await solpay.subscriptions.cancel(subscription.id);
```

### Agent Wallet Management

```typescript
// Create an agent wallet with spending limits
const agent = await solpay.agents.create({
  name: 'Research Agent #42',
  publicKey: 'AgentPublicKey...',
  owner: 'OwnerPublicKey...',
  spendingLimit: {
    daily: 10.0, // $10 per day
    perTransaction: 1.0, // $1 per transaction
  },
  allowedServices: ['/api/data', '/api/compute'],
});

// Get agent reputation
const reputation = await solpay.agents.getReputation(agent.id);
console.log(reputation);
// { score: 850, transactionCount: 1420, trustLevel: 'verified' }
```

## Features

- **x402 Payment Protection**: Protect API endpoints with automatic payment verification
- **Subscription Management**: Create and manage subscriptions with usage-based billing
- **Agent-First**: Built-in agent wallet management with spending limits and reputation
- **Multi-Token Support**: Accept USDC, USDT, SOL, and PYUSD
- **Solana-Native**: Optimized for Solana blockchain
- **TypeScript**: Full type safety and IntelliSense support

## API Reference

### `SolPay402`

Main client for interacting with 402pay.

#### Constructor

```typescript
new SolPay402(config: {
  apiKey: string;
  network?: 'mainnet-beta' | 'devnet' | 'testnet';
  rpcUrl?: string;
  facilitatorUrl?: string;
})
```

#### Methods

- `createPaymentRequirement(params)` - Create a payment requirement
- `pay(params)` - Create and send a payment transaction
- `verifyPayment(proof)` - Verify a payment proof
- `subscriptions` - Access subscription manager
- `agents` - Access agent manager

### Middleware

```typescript
createPaymentMiddleware(solpay: SolPay402, config: {
  price: number;
  currency?: string;
  resource: string;
  expiresIn?: number;
})
```

## Environment Variables

```env
SOLPAY402_API_KEY=your_api_key_here
RECIPIENT_WALLET=your_solana_wallet_address
```

## License

MIT
