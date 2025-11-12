# Kora Integration Implementation Plan

**Date:** November 11, 2025
**Goal:** Integrate Kora RPC for gasless x402 transactions
**Timeline:** 4-6 hours comprehensive implementation

---

## Phase 1: Kora Setup & Installation (1 hour)

### 1.1 Install Kora RPC Server

```bash
# Clone Kora repository
cd /tmp
git clone https://github.com/solana-foundation/kora.git
cd kora

# Checkout release branch (stable for audit)
git checkout release/feature-freeze-for-audit

# Build and install
make install

# Verify installation
kora --version
```

### 1.2 Create Kora Configuration Directory

```bash
cd /home/user/402pay
mkdir -p kora-config
```

### 1.3 Generate Kora Signer Keypair

```bash
# Generate new keypair for Kora fee payer
solana-keygen new --outfile kora-config/kora-signer.json --no-bip39-passphrase

# Get the public key
KORA_SIGNER=$(solana-keygen pubkey kora-config/kora-signer.json)
echo "Kora Signer Address: $KORA_SIGNER"

# Fund with devnet SOL (for gas fees)
solana airdrop 2 $KORA_SIGNER --url devnet
```

### 1.4 Create kora.toml Configuration

Location: `/home/user/402pay/kora-config/kora.toml`

```toml
[kora]
# RPC server configuration
bind_address = "0.0.0.0"
port = 8080
network = "devnet"
rpc_url = "https://api.devnet.solana.com"

# Authentication
[kora.auth]
api_key = "kora_402pay_api_key_v1"

# Rate limiting
[kora.rate_limit]
enabled = true
requests_per_minute = 100

# Token allowlist (USDC devnet + SOL)
[validation]
allowed_tokens = [
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", # USDC devnet
]

# Fee payer policy
[validation.fee_payer_policy]
allow_sol_transfers = false
allow_token_transfers = true
max_sol_per_transaction = "0.01"
max_accounts_per_transaction = 20

# Allowed programs
[validation]
allowed_programs = [
    "11111111111111111111111111111111",             # System Program
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",  # Token Program
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", # Associated Token Program
    "ComputeBudget111111111111111111111111111111",  # Compute Budget Program
]
```

### 1.5 Create signers.toml Configuration

Location: `/home/user/402pay/kora-config/signers.toml`

```toml
[[signers]]
name = "main_signer"
type = "memory"
private_key_file = "./kora-config/kora-signer.json"
weight = 1
```

### 1.6 Update .env with Kora Settings

```bash
# Add to .env
KORA_RPC_URL=http://localhost:8080
KORA_API_KEY=kora_402pay_api_key_v1
KORA_SIGNER_ADDRESS=<from step 1.3>
```

---

## Phase 2: Kora TypeScript Client (1 hour)

### 2.1 Create Kora Types

File: `packages/shared/src/kora-types.ts`

```typescript
/**
 * Kora RPC API Types
 * Based on: https://github.com/solana-foundation/kora
 */

// Kora RPC Request Types
export interface KoraSignTransactionRequest {
  transaction: string; // Base64-encoded transaction
  validate_only?: boolean; // If true, validate without signing
}

export interface KoraSignAndSendTransactionRequest {
  transaction: string; // Base64-encoded transaction
  options?: {
    skip_preflight?: boolean;
    preflight_commitment?: string;
  };
}

export interface KoraGetPayerSignerRequest {
  // No parameters needed
}

// Kora RPC Response Types
export interface KoraSignTransactionResponse {
  success: boolean;
  signed_transaction?: string; // Base64-encoded signed transaction
  error?: string;
  valid?: boolean; // Present when validate_only=true
}

export interface KoraSignAndSendTransactionResponse {
  success: boolean;
  signature?: string; // Transaction signature
  error?: string;
}

export interface KoraGetPayerSignerResponse {
  address: string; // Kora's fee payer address
  pubkey: string; // Same as address (alias)
}

// Kora Error Response
export interface KoraErrorResponse {
  error: {
    code: number;
    message: string;
  };
}
```

### 2.2 Create Kora Client Wrapper

File: `packages/shared/src/kora-client.ts`

```typescript
import {
  KoraSignTransactionRequest,
  KoraSignTransactionResponse,
  KoraSignAndSendTransactionRequest,
  KoraSignAndSendTransactionResponse,
  KoraGetPayerSignerResponse,
  KoraErrorResponse,
} from './kora-types';

export class KoraClient {
  private rpcUrl: string;
  private apiKey: string;

  constructor(rpcUrl: string, apiKey: string) {
    this.rpcUrl = rpcUrl;
    this.apiKey = apiKey;
  }

  /**
   * Validate transaction without signing
   */
  async validateTransaction(
    transaction: string
  ): Promise<KoraSignTransactionResponse> {
    const request: KoraSignTransactionRequest = {
      transaction,
      validate_only: true,
    };

    return this.rpcCall('signTransaction', request);
  }

  /**
   * Sign transaction (for verification)
   */
  async signTransaction(
    transaction: string
  ): Promise<KoraSignTransactionResponse> {
    const request: KoraSignTransactionRequest = {
      transaction,
      validate_only: false,
    };

    return this.rpcCall('signTransaction', request);
  }

  /**
   * Sign and send transaction (for settlement)
   */
  async signAndSendTransaction(
    transaction: string,
    options?: { skip_preflight?: boolean }
  ): Promise<KoraSignAndSendTransactionResponse> {
    const request: KoraSignAndSendTransactionRequest = {
      transaction,
      options,
    };

    return this.rpcCall('signAndSendTransaction', request);
  }

  /**
   * Get Kora's fee payer address
   */
  async getPayerSigner(): Promise<KoraGetPayerSignerResponse> {
    return this.rpcCall('getPayerSigner', {});
  }

  /**
   * Generic RPC call
   */
  private async rpcCall<T>(method: string, params: any): Promise<T> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Kora RPC error: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      const error = data.error as KoraErrorResponse['error'];
      throw new Error(`Kora RPC error: ${error.message} (code: ${error.code})`);
    }

    return data.result as T;
  }
}
```

---

## Phase 3: Update Facilitator Service (1.5 hours)

### 3.1 New Facilitator with Kora Integration

File: `packages/facilitator/src/services/x402-kora-facilitator.ts`

**Key Changes:**
- Import Kora client
- Extract unsigned transaction from payment header
- Call Kora for validation (/verify)
- Call Kora for signing & submission (/settle)
- Query Kora for fee payer address (/supported)

**Transaction Extraction:**
```typescript
// Extract unsigned Solana transaction from x402 payment payload
function extractTransactionFromPayment(paymentHeader: string): string {
  const payloadJson = Buffer.from(paymentHeader, 'base64').toString('utf-8');
  const payload: PaymentPayload = JSON.parse(payloadJson);

  // In Kora flow, payload contains unsigned transaction
  if (isSolanaPaymentData(payload.payload)) {
    const solanaData = payload.payload as SolanaPaymentData;
    // Transaction should be in a field like `unsigned_transaction`
    return solanaData.unsigned_transaction || '';
  }

  throw new Error('Invalid payment data');
}
```

**Verify Endpoint:**
```typescript
router.post('/verify', async (req, res) => {
  const { paymentHeader } = req.body;

  // Extract unsigned transaction
  const unsignedTx = extractTransactionFromPayment(paymentHeader);

  // Validate with Kora (doesn't submit)
  const result = await koraClient.validateTransaction(unsignedTx);

  return res.json({
    isValid: result.valid === true,
    invalidReason: result.error || null,
    payer: result.payer_address,
  });
});
```

**Settle Endpoint:**
```typescript
router.post('/settle', async (req, res) => {
  const { paymentHeader } = req.body;

  // Extract unsigned transaction
  const unsignedTx = extractTransactionFromPayment(paymentHeader);

  // Sign and send with Kora
  const result = await koraClient.signAndSendTransaction(unsignedTx);

  if (!result.success) {
    return res.json({
      success: false,
      error: result.error,
      txHash: '',
      networkId: 'solana-devnet',
    });
  }

  return res.json({
    success: true,
    txHash: result.signature!,
    networkId: 'solana-devnet',
    payer: koraPayerAddress,
  });
});
```

**Supported Endpoint:**
```typescript
router.get('/supported', async (req, res) => {
  // Get Kora's fee payer address
  const payerInfo = await koraClient.getPayerSigner();

  return res.json({
    kinds: [{
      x402Version: 1,
      scheme: 'exact',
      network: 'solana-devnet',
      feePayer: payerInfo.address, // Kora pays fees
    }]
  });
});
```

---

## Phase 4: Update Payment Types for Unsigned Transactions (30 min)

### 4.1 Extend SolanaPaymentData

File: `packages/shared/src/x402-spec-types.ts`

```typescript
export interface SolanaPaymentData {
  signature?: string; // Optional now (not present for unsigned)
  unsigned_transaction?: string; // Base64 transaction for Kora
  from: string;
  to: string;
  amount: string;
  mint?: string;
  timestamp: number;
}
```

---

## Phase 5: Update Middleware (30 min)

### 5.1 Handle Both Signed and Unsigned Transactions

File: `packages/facilitator/src/middleware/x402.ts`

**Change verification logic:**
```typescript
// OLD: Expect signed transaction on-chain
const tx = await connection.getTransaction(signature);

// NEW: Accept unsigned transaction (Kora will handle)
if (solanaPayload.unsigned_transaction) {
  // Unsigned flow - skip on-chain check
  // Facilitator will validate via Kora
  return { isValid: true, payment };
} else if (solanaPayload.signature) {
  // Signed flow - verify on-chain (backward compatible)
  const tx = await connection.getTransaction(solanaPayload.signature);
  // ... existing validation
}
```

---

## Phase 6: Update SDK Client (1 hour)

### 6.1 Create Unsigned Transaction Builder

File: `packages/sdk/src/x402-kora-client.ts`

```typescript
export class X402KoraClient {
  async paidRequest(url: string, options: RequestInit = {}) {
    // Step 1: Get 402 response with requirements
    const initialResponse = await fetch(url, options);

    if (initialResponse.status !== 402) {
      return /* handle non-paid */;
    }

    const paymentRequired = await initialResponse.json();
    const requirement = paymentRequired.accepts[0];

    // Step 2: Create UNSIGNED transaction
    const unsignedTx = await this.createUnsignedPaymentTransaction(requirement);

    // Step 3: Create payment payload with unsigned transaction
    const paymentPayload: PaymentPayload = {
      x402Version: 1,
      scheme: 'exact',
      network: requirement.network,
      payload: {
        unsigned_transaction: unsignedTx,
        from: this.payer.publicKey.toBase58(),
        to: requirement.payTo,
        amount: requirement.maxAmountRequired,
        timestamp: Date.now(),
      },
    };

    // Step 4: Retry with X-PAYMENT header
    const paidResponse = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-PAYMENT': Buffer.from(JSON.stringify(paymentPayload)).toString('base64'),
      },
    });

    return paidResponse;
  }

  private async createUnsignedPaymentTransaction(req: PaymentRequirements): Promise<string> {
    const transaction = new Transaction();

    // Add transfer instruction (SOL or SPL token)
    if (req.asset === '' || req.asset === 'SOL') {
      // Native SOL transfer
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.payer.publicKey,
          toPubkey: new PublicKey(req.payTo),
          lamports: BigInt(req.maxAmountRequired),
        })
      );
    } else {
      // SPL token transfer (e.g., USDC)
      // ... token transfer instruction
    }

    // Get recent blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.payer.publicKey;

    // Sign transaction (user signs, Kora will sign as fee payer)
    transaction.partialSign(this.payer);

    // Serialize and encode
    const serialized = transaction.serialize({ requireAllSignatures: false });
    return Buffer.from(serialized).toString('base64');
  }
}
```

---

## Phase 7: Update Example Endpoints (15 min)

**No changes needed!** Examples use middleware, which handles both flows.

---

## Phase 8: Testing (1 hour)

### 8.1 Start Kora RPC Server

```bash
# Terminal 1
cd /home/user/402pay
kora --config kora-config/kora.toml --signers kora-config/signers.toml
```

### 8.2 Start Facilitator

```bash
# Terminal 2
cd packages/facilitator
pnpm dev
```

### 8.3 Test Gasless Payment

```bash
# Terminal 3
curl http://localhost:3001/x402/facilitator/supported

# Expected response:
{
  "kinds": [{
    "x402Version": 1,
    "scheme": "exact",
    "network": "solana-devnet",
    "feePayer": "<KORA_SIGNER_ADDRESS>"
  }]
}
```

### 8.4 End-to-End Test

Create test script: `test-kora-payment.ts`

```typescript
import { X402KoraClient } from '@402pay/sdk';
import { Keypair } from '@solana/web3.js';

async function testGaslessPayment() {
  // Create user wallet (doesn't need SOL!)
  const userWallet = Keypair.generate();

  console.log('User address:', userWallet.publicKey.toBase58());
  console.log('User SOL balance:', 0); // No SOL needed!

  // Fund with USDC (from faucet)
  // ...

  // Create Kora-enabled client
  const client = new X402KoraClient(userWallet, 'solana-devnet');

  // Make paid request (Kora pays gas!)
  const response = await client.paidRequest('http://localhost:3001/x402/paid-greeting');

  console.log('Payment successful!');
  console.log('Response:', await response.json());
}

testGaslessPayment();
```

---

## Phase 9: Documentation (1 hour)

### 9.1 Update README.md

Add section:
- "Gasless Transactions with Kora"
- Setup instructions
- Configuration guide

### 9.2 Update X402.md

Add:
- Kora integration example
- Gasless payment flow diagram
- Fee payer explanation

### 9.3 Create KORA_SETUP.md

Step-by-step guide for:
- Installing Kora
- Configuring for production
- Deploying to mainnet
- Monitoring and maintenance

---

## Implementation Checklist

### Prerequisites
- [ ] Rust installed (for Kora build)
- [ ] Solana CLI installed
- [ ] Devnet SOL for Kora signer
- [ ] Devnet USDC for testing

### Phase 1: Kora Setup
- [ ] Clone and build Kora
- [ ] Generate Kora signer keypair
- [ ] Create kora.toml configuration
- [ ] Create signers.toml configuration
- [ ] Fund Kora signer with SOL
- [ ] Start Kora RPC server
- [ ] Verify Kora is running (port 8080)

### Phase 2: TypeScript Client
- [ ] Create kora-types.ts
- [ ] Create kora-client.ts
- [ ] Export from shared package
- [ ] Add tests for Kora client

### Phase 3: Facilitator Update
- [ ] Create x402-kora-facilitator.ts
- [ ] Implement /verify with Kora
- [ ] Implement /settle with Kora
- [ ] Implement /supported with Kora
- [ ] Register routes in main app
- [ ] Add error handling

### Phase 4: Type Updates
- [ ] Add unsigned_transaction to SolanaPaymentData
- [ ] Update type guards
- [ ] Update validators

### Phase 5: Middleware Updates
- [ ] Handle unsigned transactions
- [ ] Maintain backward compatibility
- [ ] Update error messages

### Phase 6: SDK Client Updates
- [ ] Create X402KoraClient
- [ ] Implement unsigned transaction builder
- [ ] Add SPL token support
- [ ] Export from SDK package

### Phase 7: Testing
- [ ] Test /supported endpoint
- [ ] Test /verify endpoint
- [ ] Test /settle endpoint
- [ ] End-to-end gasless payment test
- [ ] Test with USDC payments
- [ ] Test error scenarios

### Phase 8: Documentation
- [ ] Update README.md
- [ ] Update X402.md
- [ ] Create KORA_SETUP.md
- [ ] Add architecture diagrams
- [ ] Document configuration options

---

## Success Criteria

✅ **Kora RPC Running:** Server operational on port 8080
✅ **Facilitator Integration:** All 3 endpoints use Kora
✅ **Gasless Payments:** Users can pay without SOL
✅ **USDC Support:** Can pay in USDC devnet tokens
✅ **Backward Compatible:** Old signed flow still works
✅ **Tests Passing:** End-to-end payment flows work
✅ **Documentation Complete:** Setup guide ready

---

## Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| 1. Kora Setup | 1h | 1h |
| 2. TypeScript Client | 1h | 2h |
| 3. Facilitator Update | 1.5h | 3.5h |
| 4. Type Updates | 0.5h | 4h |
| 5. Middleware Updates | 0.5h | 4.5h |
| 6. SDK Client Updates | 1h | 5.5h |
| 7. Testing | 1h | 6.5h |
| 8. Documentation | 1h | 7.5h |

**Total Estimated Time:** 7.5 hours

**Buffer for Issues:** +1.5 hours

**Total with Buffer:** 9 hours

---

## Next Step

Ready to begin implementation! Starting with Phase 1: Kora Setup.

Would you like me to:
1. **Start implementing now** (begin with Kora setup)
2. **Review plan first** (make adjustments)
3. **Create helper scripts** (automation for setup)

Your call - let's build this! 🚀
