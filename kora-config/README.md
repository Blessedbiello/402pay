# Kora RPC Configuration

This directory contains configuration files for the Kora gasless transaction signing service.

## Quick Setup

### 1. Generate Fee Payer Keypair

```bash
# Create keypairs directory
mkdir -p kora-config/keypairs

# Generate new keypair (devnet)
solana-keygen new --outfile kora-config/keypairs/fee-payer.json

# Save the public key that's displayed
```

### 2. Fund the Fee Payer

**For Devnet:**
```bash
# Get some SOL from the faucet
solana airdrop 2 <YOUR_PUBKEY> --url devnet

# Check balance
solana balance <YOUR_PUBKEY> --url devnet
```

**For Mainnet:**
```bash
# Transfer SOL from your wallet to the fee payer address
# You'll need enough SOL to cover gas fees for your expected transaction volume
# Recommended: Start with 0.5-1 SOL and monitor
```

### 3. Install Kora RPC Server

```bash
# Using Cargo (Rust package manager)
cargo install kora-rpc

# Or clone and build from source
git clone https://github.com/solana-foundation/kora
cd kora
cargo build --release
```

### 4. Start Kora RPC Server

```bash
# From the 402pay root directory
kora-rpc --config ./kora-config/kora.toml

# Or if built from source
./target/release/kora-rpc --config ./kora-config/kora.toml
```

### 5. Update Environment Variables

Add to your `.env` file:

```bash
# Kora RPC Configuration
KORA_RPC_URL=http://localhost:8080
KORA_API_KEY=your-api-key-here  # Optional but recommended for production

# Enable mainnet support (optional)
KORA_MAINNET_ENABLED=false
```

### 6. Verify Kora is Running

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

## Configuration Files

- **kora.toml**: Main server configuration (RPC endpoint, logging, etc.)
- **signers.toml**: Fee payer keypair configuration
- **keypairs/**: Directory for keypair files (NOT committed to git)

## Security Best Practices

1. **Never commit keypair files to git** - They're in .gitignore
2. **Use different keypairs for dev/staging/production**
3. **Monitor fee payer balance** - Set up alerts when low
4. **Rotate keypairs periodically** - Especially if compromised
5. **Use API keys in production** - Set KORA_API_KEY
6. **Limit CORS origins** - Don't use "*" in production

## Monitoring

Monitor your fee payer balance regularly:

```bash
# Check balance
solana balance $(solana-keygen pubkey kora-config/keypairs/fee-payer.json) --url devnet

# Set up a cron job to alert when balance is low
```

## Troubleshooting

### Kora won't start
- Check that the keypair file exists and has correct permissions
- Verify the Solana RPC URL is accessible
- Check logs for specific error messages

### Transactions failing
- Ensure fee payer has sufficient SOL balance
- Check Solana network status (may be congested)
- Verify transaction structure is valid

### API key issues
- Make sure KORA_API_KEY environment variable matches
- Check that `require_api_key` is set correctly in kora.toml

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

## Additional Resources

- [Kora GitHub Repository](https://github.com/solana-foundation/kora)
- [Solana x402 Integration Guide](https://github.com/coinbase/x402/blob/main/docs/integrations/solana.md)
- [402pay Documentation](../README.md)
