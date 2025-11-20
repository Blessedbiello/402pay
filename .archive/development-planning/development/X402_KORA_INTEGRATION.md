# x402 Protocol + Kora Gasless Integration

**Complete Implementation Guide**

This document describes the Kora RPC integration for 402pay, enabling **gasless transactions** where users don't need SOL for gas fees.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [What Changed](#what-changed)
4. [Setup Guide](#setup-guide)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Testing](#testing)
8. [Migration Guide](#migration-guide)

---

## Overview

### What is Kora?

Kora is a gasless transaction signing service for Solana that allows users to pay in USDC or other SPL tokens **without needing SOL** for gas fees. The Kora server signs transactions as the fee payer and submits them to Solana.

### Why Kora + x402?

**Before (Direct RPC):**
- ❌ Users must hold SOL for gas fees
- ❌ Extra friction for new users
- ❌ Users must manage two assets (payment token + SOL)

**After (Kora Integration):**
- ✅ Users pay only in USDC (or other tokens)
- ✅ Kora pays gas fees automatically
- ✅ Better UX for end users
- ✅ Still 100% x402 spec-compliant

### Both Flows Supported

402pay now supports **BOTH** payment flows:

1. **Direct RPC Flow** (original)
   - User submits transaction to Solana
   - User pays gas fees in SOL
   - Facilitator verifies on-chain

2. **Kora Gasless Flow** (new)
   - User creates unsigned transaction
   - Kora signs as fee payer
   - Kora submits to Solana
   - User doesn't need SOL

---

## Architecture

### Direct RPC Flow (Original)

```
Client                      Facilitator              Solana
  │                              │                      │
  │ 1. Create & sign tx          │                      │
  ├─────────────────────────────►│                      │
  │                              │ 2. Submit tx         │
  │                              ├─────────────────────►│
  │                              │                      │
  │ 3. GET /protected            │                      │
  │    (X-PAYMENT: signature)    │                      │
  ├─────────────────────────────►│                      │
  │                              │ 4. Verify on-chain   │
  │                              ├─────────────────────►│
  │                              │ 5. Confirmed ✓       │
  │                              │◄─────────────────────┤
  │ 6. Protected resource        │                      │
  │◄─────────────────────────────┤                      │
```

### Kora Gasless Flow (New)

```
Client         Facilitator      Kora RPC         Solana
  │                 │               │                │
  │ 1. Create unsigned tx           │                │
  │                 │               │                │
  │ 2. GET /protected               │                │
  │    (X-PAYMENT: unsigned_tx)     │                │
  ├────────────────►│               │                │
  │                 │ 3. POST /verify                │
  │                 ├──────────────►│                │
  │                 │               │ 4. Validate tx │
  │                 │ 5. Valid ✓    │                │
  │                 │◄──────────────┤                │
  │                 │ 6. POST /settle                │
  │                 ├──────────────►│                │
  │                 │               │ 7. Sign & send │
  │                 │               ├───────────────►│
  │                 │               │ 8. Signature   │
  │                 │ 9. Settled ✓  │◄───────────────┤
  │                 │◄──────────────┤                │
  │ 10. Protected resource          │                │
  │◄────────────────┤               │                │
```

---

## What Changed

### 1. New Type Definitions

**File:** `packages/shared/src/kora-types.ts`

- Complete Kora RPC JSON-RPC 2.0 protocol types
- `KoraSignTransactionRequest/Response`
- `KoraSignAndSendTransactionRequest/Response`
- `KoraGetPayerSignerResponse`
- `KoraRPCError` class

### 2. Kora Client Wrapper

**File:** `packages/shared/src/kora-client.ts`

TypeScript client for Kora RPC:

```typescript
export class KoraClient {
  // Validate transaction without signing
  async validateTransaction(transaction: string): Promise<KoraSignTransactionResponse>

  // Sign transaction (without sending)
  async signTransaction(transaction: string): Promise<KoraSignTransactionResponse>

  // Sign and send transaction (gasless!)
  async signAndSendTransaction(transaction: string, options?): Promise<KoraSignAndSendTransactionResponse>

  // Get Kora's fee payer address
  async getPayerSigner(): Promise<KoraGetPayerSignerResponse>

  // Health check
  async health(): Promise<KoraHealthResponse>
}
```

### 3. Updated Payment Types

**File:** `packages/shared/src/x402-spec-types.ts`

```typescript
export interface SolanaPaymentData {
  // Direct RPC flow (optional now)
  signature?: string;

  // Kora gasless flow (new!)
  unsigned_transaction?: string;

  // Required fields (same)
  from: string;
  to: string;
  amount: string;
  mint?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}
```

**Updated type guard:**

```typescript
export function isSolanaPaymentData(payload: any): payload is SolanaPaymentData {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    ('signature' in payload || 'unsigned_transaction' in payload) && // ← Both supported
    'from' in payload &&
    'to' in payload &&
    'amount' in payload &&
    'timestamp' in payload
  );
}
```

### 4. Kora Facilitator Service

**File:** `packages/facilitator/src/services/x402-kora-facilitator.ts`

New facilitator service with 3 endpoints:

1. **POST /x402/kora/verify** - Validate payment without settlement
2. **POST /x402/kora/settle** - Execute gasless payment via Kora
3. **GET /x402/kora/supported** - Advertise capabilities (includes fee payer)
4. **GET /x402/kora/health** - Health check with Kora connectivity

**Routes registered in:** `packages/facilitator/src/index.ts`

```typescript
app.use('/x402/kora', publicRateLimiter, x402KoraFacilitatorRouter);
```

### 5. Updated Middleware

**File:** `packages/facilitator/src/middleware/x402.ts`

- Added `facilitatorUrl` and `useGasless` config options
- Auto-detects flow based on `unsigned_transaction` field
- Calls facilitator's `/verify` endpoint for gasless flow
- Maintains backward compatibility with direct RPC flow

```typescript
export interface X402Config {
  // ... existing fields ...

  /** Facilitator URL for gasless transactions (optional) */
  facilitatorUrl?: string;

  /** Enable gasless flow (uses facilitator instead of on-chain verification) */
  useGasless?: boolean;
}
```

### 6. Configuration Files

**Created:**
- `kora-config/kora.toml` - Kora server configuration
- `kora-config/signers.toml` - Fee payer keypair configuration
- `kora-config/README.md` - Setup instructions
- `.env.example` - Environment variables documentation

**Updated:**
- `.gitignore` - Added `kora-config/keypairs/` to prevent key leakage

---

## Setup Guide

### Prerequisites

- Node.js 18+
- Solana CLI
- Cargo (Rust) - for building Kora
- SOL for fee payer funding

### Step 1: Install Kora RPC

#### Option A: Install from crates.io (when available)

```bash
cargo install kora-rpc
```

#### Option B: Build from source

```bash
git clone https://github.com/solana-foundation/kora
cd kora
cargo build --release

# Binary will be at: target/release/kora-rpc
```

### Step 2: Generate Fee Payer Keypair

```bash
# Create keypairs directory
mkdir -p kora-config/keypairs

# Generate keypair for devnet
solana-keygen new --outfile kora-config/keypairs/fee-payer.json

# Save the public key displayed!
```

### Step 3: Fund Fee Payer

**For Devnet:**

```bash
# Get SOL from faucet
solana airdrop 2 <FEE_PAYER_PUBKEY> --url devnet

# Verify balance
solana balance <FEE_PAYER_PUBKEY> --url devnet
```

**For Mainnet:**

```bash
# Transfer SOL to fee payer address
# Recommended: Start with 0.5-1 SOL and monitor usage
```

### Step 4: Configure Environment

Create `.env` file (copy from `.env.example`):

```bash
# Kora Configuration
KORA_RPC_URL=http://localhost:8080
KORA_API_KEY=your-api-key-here

# Kora Facilitator URL (for middleware)
KORA_FACILITATOR_URL=http://localhost:3001/x402/kora

# Enable mainnet (optional)
KORA_MAINNET_ENABLED=false

# Solana Configuration
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PAYMENT_RECIPIENT_ADDRESS=your-wallet-address
```

### Step 5: Start Kora RPC Server

```bash
# From 402pay root directory
kora-rpc --config ./kora-config/kora.toml

# Or if built from source:
./kora/target/release/kora-rpc --config ./kora-config/kora.toml
```

Expected output:

```
[2024-XX-XX] INFO kora_rpc: Kora RPC server starting
[2024-XX-XX] INFO kora_rpc: Loaded signer: 402pay-fee-payer
[2024-XX-XX] INFO kora_rpc: Fee payer: <PUBKEY>
[2024-XX-XX] INFO kora_rpc: Listening on http://127.0.0.1:8080
```

### Step 6: Verify Kora is Running

```bash
# Health check
curl http://localhost:8080/health

# Get fee payer address
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getPayerSigner",
    "params": {}
  }'
```

### Step 7: Start 402pay Facilitator

```bash
cd packages/facilitator
npm run dev
```

### Step 8: Test Kora Facilitator Endpoint

```bash
# Check supported networks
curl http://localhost:3001/x402/kora/supported

# Expected response:
{
  "kinds": [
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "solana-devnet",
      "feePayer": "<KORA_FEE_PAYER_ADDRESS>"
    }
  ]
}
```

---

## Usage Examples

### Example 1: Protected Route with Gasless Payment

```typescript
import { x402Middleware } from './middleware/x402';

// Enable gasless flow
app.get('/api/premium-data',
  x402Middleware({
    amount: '1000000', // 0.001 SOL worth
    payTo: 'YOUR_WALLET_ADDRESS',
    description: 'Premium data access',
    network: 'solana-devnet',
    useGasless: true, // ← Enable Kora gasless flow
    facilitatorUrl: 'http://localhost:3001/x402/kora',
  }),
  (req, res) => {
    // Payment verified (gasless!)
    res.json({ data: 'Premium content' });
  }
);
```

### Example 2: Client Making Gasless Payment

```typescript
import { Connection, Transaction, SystemProgram } from '@solana/web3.js';

// 1. Create unsigned transaction
const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: userWallet.publicKey,
    toPubkey: new PublicKey(paymentRecipient),
    lamports: 1000000,
  })
);

// 2. Set recent blockhash
const { blockhash } = await connection.getLatestBlockhash();
tx.recentBlockhash = blockhash;
tx.feePayer = userWallet.publicKey;

// 3. User signs (but doesn't pay gas!)
tx.partialSign(userWallet);

// 4. Serialize unsigned transaction
const unsignedTx = tx.serialize({
  requireAllSignatures: false,
  verifySignatures: false,
}).toString('base64');

// 5. Create payment payload
const paymentPayload = {
  x402Version: 1,
  scheme: 'exact',
  network: 'solana-devnet',
  payload: {
    unsigned_transaction: unsignedTx, // ← Unsigned transaction for Kora
    from: userWallet.publicKey.toString(),
    to: paymentRecipient,
    amount: '1000000',
    timestamp: Date.now(),
  },
};

// 6. Make request with payment header
const response = await fetch('http://localhost:3001/api/premium-data', {
  headers: {
    'X-PAYMENT': Buffer.from(JSON.stringify(paymentPayload)).toString('base64'),
  },
});

// 7. Check payment response
const paymentResponse = response.headers.get('X-PAYMENT-RESPONSE');
if (paymentResponse) {
  const decoded = JSON.parse(
    Buffer.from(paymentResponse, 'base64').toString('utf-8')
  );
  console.log('Payment successful!', decoded);
  // { success: true, transaction: "signature", network: "solana-devnet", payer: "..." }
}
```

### Example 3: Using Kora Client Directly

```typescript
import { KoraClient } from '@402pay/shared';

const kora = new KoraClient('http://localhost:8080', 'your-api-key');

// Validate transaction (POST /verify)
const validation = await kora.validateTransaction(unsignedTx);
console.log('Valid:', validation.valid);

// Sign and send (POST /settle)
const result = await kora.signAndSendTransaction(unsignedTx, {
  skip_preflight: false,
  preflight_commitment: 'confirmed',
});

console.log('Transaction signature:', result.signature);
// User didn't pay gas - Kora did! ✨
```

---

## API Reference

### Kora Facilitator Endpoints

#### POST /x402/kora/verify

Validates payment without settlement.

**Request:**

```json
{
  "x402Version": 1,
  "paymentHeader": "base64-encoded-payment-payload",
  "paymentRequirements": {
    "scheme": "exact",
    "network": "solana-devnet",
    "maxAmountRequired": "1000000",
    "payTo": "recipient-address",
    "asset": "",
    "resource": "/api/data",
    "description": "Data access",
    "maxTimeoutSeconds": 60,
    "mimeType": "application/json"
  }
}
```

**Response:**

```json
{
  "isValid": true,
  "payer": "user-wallet-address"
}
```

#### POST /x402/kora/settle

Executes payment on-chain via Kora (gasless).

**Request:** Same as `/verify`

**Response:**

```json
{
  "success": true,
  "txHash": "transaction-signature",
  "networkId": "solana-devnet",
  "payer": "user-wallet-address"
}
```

#### GET /x402/kora/supported

Returns supported payment schemes.

**Response:**

```json
{
  "kinds": [
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "solana-devnet",
      "feePayer": "kora-fee-payer-address"
    }
  ]
}
```

#### GET /x402/kora/health

Health check with Kora connectivity status.

**Response:**

```json
{
  "status": "ok",
  "service": "x402-kora-facilitator",
  "version": 1,
  "timestamp": 1234567890,
  "kora": {
    "status": "ok",
    "url": "http://localhost:8080",
    "payerAddress": "fee-payer-pubkey"
  }
}
```

---

## Testing

### Unit Tests (TODO)

```bash
# Test Kora client
cd packages/shared
npm test -- kora-client.test.ts

# Test Kora facilitator
cd packages/facilitator
npm test -- x402-kora-facilitator.test.ts
```

### Integration Test

```bash
# 1. Start Kora RPC
kora-rpc --config ./kora-config/kora.toml

# 2. Start facilitator (in another terminal)
cd packages/facilitator
npm run dev

# 3. Run end-to-end test (in another terminal)
cd packages/facilitator
npm run test:e2e -- kora-gasless.test.ts
```

### Manual Testing

See [kora-config/README.md](./kora-config/README.md#verify-kora-is-running) for manual testing steps.

---

## Migration Guide

### From Direct RPC to Kora Gasless

#### 1. Update Middleware Configuration

**Before:**

```typescript
app.get('/protected',
  x402Middleware({
    amount: '1000000',
    payTo: 'WALLET_ADDRESS',
    description: 'Premium data',
  }),
  handler
);
```

**After:**

```typescript
app.get('/protected',
  x402Middleware({
    amount: '1000000',
    payTo: 'WALLET_ADDRESS',
    description: 'Premium data',
    useGasless: true, // ← Enable Kora
    facilitatorUrl: process.env.KORA_FACILITATOR_URL,
  }),
  handler
);
```

#### 2. Update Client Payment Flow

**Before (Direct RPC):**

```typescript
// User creates, signs, and SUBMITS transaction
const signature = await connection.sendTransaction(tx, [userWallet]);
await connection.confirmTransaction(signature);

// Include signature in payment
const payload = {
  signature, // ← Transaction already on-chain
  from: user,
  to: recipient,
  amount: '1000000',
  timestamp: Date.now(),
};
```

**After (Kora Gasless):**

```typescript
// User creates and signs, but DOESN'T submit
tx.partialSign(userWallet);

const unsignedTx = tx.serialize({
  requireAllSignatures: false,
}).toString('base64');

// Include unsigned transaction in payment
const payload = {
  unsigned_transaction: unsignedTx, // ← Kora will sign & send
  from: user,
  to: recipient,
  amount: '1000000',
  timestamp: Date.now(),
};
```

#### 3. Update Environment Variables

Add to `.env`:

```bash
KORA_RPC_URL=http://localhost:8080
KORA_API_KEY=your-key
KORA_FACILITATOR_URL=http://localhost:3001/x402/kora
```

---

## Production Checklist

- [ ] Generate production keypair (keep secure!)
- [ ] Fund fee payer with adequate SOL
- [ ] Enable API key authentication
- [ ] Configure specific CORS origins
- [ ] Set up balance monitoring/alerts
- [ ] Use production Solana RPC endpoint
- [ ] Enable structured logging (JSON format)
- [ ] Set up automatic restarts (systemd, PM2, etc.)
- [ ] Configure rate limiting appropriately
- [ ] Back up keypair securely (encrypted)
- [ ] Test failover to direct RPC if Kora is down
- [ ] Monitor Kora RPC uptime
- [ ] Set up PagerDuty/alerts for low balance

---

## Troubleshooting

### Kora Won't Start

**Error:** `Failed to load signer`

**Solution:** Check that keypair file exists and has correct path in `signers.toml`

**Error:** `Connection refused to Solana RPC`

**Solution:** Verify `SOLANA_RPC_URL` is accessible

### Transactions Failing

**Error:** `insufficient funds for fee payer`

**Solution:** Fund the Kora fee payer address with more SOL

**Error:** `transaction simulation failed`

**Solution:** Check that user has sufficient funds for the payment amount (not gas)

### Verification Failing

**Error:** `Facilitator verification failed`

**Solution:** Check Kora RPC is running (`curl http://localhost:8080/health`)

**Error:** `unsigned_transaction required`

**Solution:** Ensure client is sending unsigned transaction, not signature

---

## Additional Resources

- [Official Kora Repository](https://github.com/solana-foundation/kora)
- [Solana x402 Integration Guide](https://github.com/coinbase/x402/blob/main/docs/integrations/solana.md)
- [x402 Specification](https://github.com/coinbase/x402)
- [402pay Documentation](./README.md)
- [Kora Setup Guide](./kora-config/README.md)

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Kora docs](https://github.com/solana-foundation/kora)
3. Open an issue on GitHub
4. Join the #402pay Discord channel

---

**🎉 Congratulations!** You now have gasless x402 payments powered by Kora!
