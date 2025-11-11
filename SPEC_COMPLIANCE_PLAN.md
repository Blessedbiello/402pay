# x402 Protocol Spec Compliance - Implementation Plan

**Date:** November 11, 2025
**Status:** Ready to implement
**Goal:** Full compliance with official Coinbase x402 specification

---

## Research Complete ✅

Based on comprehensive research of:
- Official Coinbase x402 specification (https://github.com/coinbase/x402)
- Solana x402 integration guide
- Official npm packages (x402, x402-solana)
- Multiple facilitator implementations

---

## Field Name Corrections Required

### PaymentRequirements / PaymentRequirementsResponse

**Current (WRONG):**
```typescript
interface X402PaymentRequirement {
  scheme: string;
  network: string;
  maxAmountRequired: string;
  recipient: string;              // ❌ WRONG
  resource: string;
  description: string;
  mimeType?: string;
  assetAddress?: string;          // ❌ WRONG
  timeout?: number;               // ❌ WRONG (also milliseconds vs seconds)
  metadata?: Record<string, any>; // ❌ WRONG
}

interface X402PaymentRequiredResponse {
  x402Version: string;
  paymentRequirements: X402PaymentRequirement[];  // ❌ WRONG field name
  error?: {
    code: string;
    message: string;
  };
}
```

**Official Spec (CORRECT):**
```typescript
interface PaymentRequirements {
  scheme: string;                 // ✅ Correct
  network: string;                // ✅ Correct
  maxAmountRequired: string;      // ✅ Correct
  payTo: string;                  // ✅ Official field name
  resource: string;               // ✅ Correct
  description: string;            // ✅ Correct
  mimeType?: string;              // ✅ Correct
  asset: string;                  // ✅ Official field name (required)
  maxTimeoutSeconds: number;      // ✅ Official field name (in SECONDS)
  extra?: object | null;          // ✅ Official field name
  outputSchema?: object | null;   // ✅ Additional official field
}

interface PaymentRequirementsResponse {
  x402Version: number;            // ✅ Official uses number, not string
  accepts: PaymentRequirements[]; // ✅ Official field name
  error?: string;                 // ✅ Simple string, not object
}
```

### PaymentPayload

**Current:**
```typescript
interface X402PaymentPayload {
  x402Version: string;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    from: string;
    to: string;
    amount: string;
    mint?: string;
    timestamp: number;
    metadata?: Record<string, any>;
  };
}
```

**Official Spec:**
```typescript
interface PaymentPayload {
  x402Version: number;            // number, not string
  scheme: string;
  network: string;
  payload: SolanaPayload;         // Scheme-specific
}

// For Solana "exact" scheme
interface SolanaPayload {
  signature: string;              // ✅ Correct
  from: string;                   // ✅ Correct
  to: string;                     // ✅ Correct
  amount: string;                 // ✅ Correct
  mint?: string;                  // ✅ Correct (optional for native SOL)
  timestamp: number;              // ✅ Correct
  metadata?: Record<string, any>; // ✅ Correct
}
```

### PaymentResponse

**Current:**
```typescript
interface X402PaymentResponse {
  success: boolean;
  transactionHash?: string;       // ❌ WRONG
  network?: string;               // ❌ Should be "networkId"
  error?: {                       // ❌ Should be simple string
    code: string;
    message: string;
  };
  resource?: {                    // ❌ Not in spec
    id: string;
    type: string;
  };
}
```

**Official Spec:**
```typescript
interface PaymentResponse {
  success: boolean;               // ✅ Correct
  transaction: string;            // ✅ Official field name (was transactionHash)
  network: string;                // ✅ Correct for this field
  payer: string;                  // ✅ Required field we're missing
  errorReason?: string;           // ✅ Simple string (was error object)
}
```

---

## Facilitator Endpoints - Required Implementation

### Current State

We have:
- ❌ `/verify` exists but uses custom schema (PaymentProof), not x402 schema
- ❌ No `/settle` endpoint
- ❌ No `/supported` endpoint
- ✅ `/x402/*` example endpoints (but they don't use facilitator pattern)

### Required State

**POST /verify**
```typescript
// Request
interface VerifyRequest {
  x402Version: number;
  paymentHeader: string;          // Base64-encoded PaymentPayload
  paymentRequirements: PaymentRequirements;
}

// Response
interface VerifyResponse {
  isValid: boolean;
  invalidReason?: string | null;
  payer?: string;
}
```

**POST /settle**
```typescript
// Request
interface SettleRequest {
  x402Version: number;
  paymentHeader: string;
  paymentRequirements: PaymentRequirements;
}

// Response
interface SettleResponse {
  success: boolean;
  error?: string | null;
  txHash: string;                 // Transaction signature
  networkId: string;
  payer?: string;
}
```

**GET /supported**
```typescript
// Response
interface SupportedResponse {
  kinds: SupportedKind[];
}

interface SupportedKind {
  x402Version: number;
  scheme: string;                 // "exact"
  network: string;                // "solana-devnet"
}
```

---

## Architecture Transformation

### Current Architecture (Inline)

```
Client → x402Middleware (inline)
           ↓
         Solana RPC (direct)
           ↓
         Blockchain
```

### Target Architecture (Facilitator Pattern)

```
Client → Protected API Server
           ↓ (calls)
         x402 Facilitator Service
           ├─ POST /verify (validation only)
           ├─ POST /settle (broadcast to chain)
           └─ GET /supported (capability discovery)
           ↓
         Solana RPC
           ↓
         Blockchain
```

---

## Implementation Steps

### Phase 1: Update Type Definitions (30 min)

1. **Create new spec-compliant types** (`packages/shared/src/x402-spec-types.ts`)
   - PaymentRequirements (with correct field names)
   - PaymentRequirementsResponse (with `accepts` array)
   - PaymentPayload (number version, not string)
   - PaymentResponse (with `transaction`, `payer`)
   - VerifyRequest/Response
   - SettleRequest/Response
   - SupportedResponse

2. **Keep old types** as deprecated (for backwards compatibility during transition)

3. **Export both** from `packages/shared/src/index.ts`

### Phase 2: Build Facilitator Service (2 hours)

Create `packages/facilitator/src/services/x402-facilitator.ts`:

1. **POST /verify endpoint**
   - Accept x402 schema request
   - Decode base64 paymentHeader
   - Validate PaymentPayload structure
   - Verify signature matches transaction
   - Check amount, recipient, network
   - Return `isValid` + `invalidReason`

2. **POST /settle endpoint**
   - Accept x402 schema request
   - Decode and verify payment (reuse /verify logic)
   - Submit transaction to Solana
   - Wait for confirmation
   - Return `txHash`, `networkId`, `payer`

3. **GET /supported endpoint**
   - Return supported schemes: ["exact"]
   - Return supported networks: ["solana-devnet", "solana"]
   - Return x402Version: 1

### Phase 3: Update Middleware (1 hour)

Update `packages/facilitator/src/middleware/x402.ts`:

1. **Change field names** in X402Config:
   - `recipient` → `payTo`
   - `assetAddress` → `asset`
   - `timeout` → `maxTimeoutSeconds` (convert ms to seconds)
   - `metadata` → `extra`

2. **Update 402 response** to use `accepts` array:
   ```typescript
   {
     x402Version: 1,
     accepts: [paymentRequirement],
     error?: "..."
   }
   ```

3. **Call facilitator service** instead of inline verification:
   ```typescript
   // Instead of inline verifyPayment()
   const verifyResult = await fetch(`${facilitatorUrl}/verify`, {
     method: 'POST',
     body: JSON.stringify({
       x402Version: 1,
       paymentHeader,
       paymentRequirements
     })
   });
   ```

4. **Update X-PAYMENT-RESPONSE** header:
   - Use `transaction` instead of `transactionHash`
   - Add `payer` field
   - Use simple `errorReason` string

### Phase 4: Update SDK Client (1 hour)

Update `packages/sdk/src/x402-client.ts`:

1. **Parse new response format**:
   - Expect `accepts` array instead of `paymentRequirements`
   - Handle `x402Version` as number

2. **Create correct PaymentPayload**:
   - Use `x402Version: 1` (number)
   - Ensure all required fields present

3. **Handle new PaymentResponse**:
   - Read `transaction` field
   - Read `payer` field
   - Handle `errorReason` string

### Phase 5: Update Example Endpoints (30 min)

Update `packages/facilitator/src/routes/x402-examples.ts`:

1. **Update all endpoints** to use new middleware config
2. **Change field names** in configurations
3. **Test with spec-compliant client**

### Phase 6: Register Facilitator Routes (15 min)

Update `packages/facilitator/src/index.ts`:

```typescript
import { x402FacilitatorRouter } from './services/x402-facilitator';

// Add facilitator endpoints
app.use('/facilitator', x402FacilitatorRouter);
// This gives us:
// POST /facilitator/verify
// POST /facilitator/settle
// GET /facilitator/supported
```

### Phase 7: Testing (1 hour)

1. **Unit tests** for facilitator endpoints
2. **Integration test** for complete flow:
   ```
   Client request → 402 response
   Client creates payment → calls /verify
   Facilitator verifies → returns isValid
   Client retries with X-PAYMENT → calls /settle
   Facilitator settles → returns txHash
   Server returns content → 200 OK
   ```

3. **Manual testing** with curl and SDK

### Phase 8: Documentation (1 hour)

1. **Update X402.md**:
   - Show correct field names
   - Document facilitator endpoints
   - Add architecture diagram
   - Update code examples

2. **Update README.md**:
   - Correct x402 section
   - Add facilitator architecture

3. **Update HACKATHON_ANALYSIS.md**:
   - Mark as fully compliant
   - Update win probabilities

---

## File Changes Summary

### New Files
- `packages/shared/src/x402-spec-types.ts` - Spec-compliant types
- `packages/facilitator/src/services/x402-facilitator.ts` - Facilitator service
- `packages/facilitator/src/routes/facilitator.ts` - Facilitator routes

### Modified Files
- `packages/shared/src/x402-types.ts` - Mark as deprecated, migrate to spec types
- `packages/shared/src/index.ts` - Export new spec types
- `packages/facilitator/src/middleware/x402.ts` - Use facilitator service
- `packages/facilitator/src/routes/x402-examples.ts` - Update field names
- `packages/facilitator/src/index.ts` - Register facilitator routes
- `packages/sdk/src/x402-client.ts` - Handle new schemas
- `X402.md` - Update documentation
- `README.md` - Update x402 section
- `HACKATHON_ANALYSIS.md` - Update compliance status

---

## Expected Timeline

| Phase | Task | Time | Status |
|-------|------|------|--------|
| 1 | Update type definitions | 30 min | Pending |
| 2 | Build facilitator service | 2 hours | Pending |
| 3 | Update middleware | 1 hour | Pending |
| 4 | Update SDK client | 1 hour | Pending |
| 5 | Update example endpoints | 30 min | Pending |
| 6 | Register facilitator routes | 15 min | Pending |
| 7 | Testing | 1 hour | Pending |
| 8 | Documentation | 1 hour | Pending |
| **TOTAL** | | **~7 hours** | |

---

## Success Criteria

After implementation, we must have:

✅ All field names match official x402 specification
✅ POST /facilitator/verify endpoint working
✅ POST /facilitator/settle endpoint working
✅ GET /facilitator/supported endpoint working
✅ Middleware calls facilitator service (not inline)
✅ SDK works with new schemas
✅ Complete payment flow tested end-to-end
✅ Documentation updated and accurate
✅ 100% x402 specification compliance

---

## Compliance Score

**Before:** 54-60%
**After:** 100% ✅

---

**Ready to implement. Starting with Phase 1.**

