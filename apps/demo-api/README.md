# 402pay Demo API

Example API showcasing how easy it is to integrate x402 payments using 402pay.

## Features

- **3 lines of code** to add payment protection to any endpoint
- **Pay-per-request** pricing model
- **Multiple price tiers** for different data quality
- **Subscription support** example

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Solana wallet address
```

### 3. Start the API

```bash
npm run dev
```

### 4. Test the API

Visit `http://localhost:3000` to see available endpoints.

## API Endpoints

### Public (Free)

- `GET /` - API documentation
- `GET /health` - Health check

### Protected (Paid)

- `GET /api/crypto-price` - Real-time crypto prices (0.01 USDC)
- `GET /api/market-data` - Advanced market analytics (0.05 USDC)
- `GET /api/ai-insights` - AI-powered insights (0.10 USDC)

## How It Works

### 1. Without Payment

```bash
curl http://localhost:3000/api/crypto-price
```

**Response: 402 Payment Required**
```json
{
  "error": "Payment Required",
  "requirement": {
    "amount": 0.01,
    "currency": "USDC",
    "recipient": "YourWalletAddress...",
    "nonce": "...",
    "expiresAt": 1234567890
  }
}
```

### 2. With Payment

```bash
curl http://localhost:3000/api/crypto-price \
  -H "X-PAYMENT: <base64-encoded-payment-proof>"
```

**Response: 200 OK**
```json
{
  "data": {
    "SOL": { "price": 143.52, "change24h": 5.23 },
    "BTC": { "price": 67423.12, "change24h": 2.15 }
  }
}
```

## Integration Code

The entire payment protection is just **3 lines**:

```typescript
import { SolPay402, createPaymentMiddleware } from '@402pay/sdk';

const solpay = new SolPay402({ apiKey: 'your_key', network: 'devnet' });

app.get('/api/data',
  createPaymentMiddleware(solpay, { price: 0.01, resource: '/api/data' }),
  (req, res) => {
    res.json({ data: 'Your premium content' });
  }
);
```

## Testing with Client

Coming soon: Example client code for making payments.

## License

MIT
