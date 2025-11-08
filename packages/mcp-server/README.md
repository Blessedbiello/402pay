# @402pay/mcp-server

Model Context Protocol (MCP) server for AI agents to make x402 payments autonomously.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that enables AI agents to securely connect to external tools and data sources. Our MCP server allows AI agents to:

- Make paid API requests automatically
- Manage Solana wallets
- Handle x402 payment flows transparently
- Track spending and reputation

## Installation

```bash
npm install -g @402pay/mcp-server
```

## Configuration

### 1. Set Up Environment

```bash
# Create .env file
cat > .env << EOF
SOLPAY402_API_KEY=your_api_key
AGENT_WALLET_SECRET_KEY=[1,2,3,...]  # Your Solana keypair
SOLANA_NETWORK=devnet
FACILITATOR_URL=http://localhost:3001
EOF
```

### 2. Configure MCP Client

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "402pay": {
      "command": "npx",
      "args": ["@402pay/mcp-server"],
      "env": {
        "SOLPAY402_API_KEY": "your_key",
        "SOLANA_NETWORK": "devnet"
      }
    }
  }
}
```

## Available Tools

### 1. `make_paid_request`

Make an API request that requires x402 payment. Automatically handles the payment flow.

**Parameters:**
- `url` (string, required) - The API endpoint URL
- `method` (string) - HTTP method (GET, POST, PUT, DELETE)
- `body` (object) - Request body for POST/PUT
- `headers` (object) - Additional HTTP headers

**Example:**

```typescript
// Agent uses the tool
await mcp.callTool('make_paid_request', {
  url: 'https://api.example.com/premium-data',
  method: 'GET'
});

// Output:
{
  "success": true,
  "paid": true,
  "amount": 0.01,
  "currency": "USDC",
  "transactionId": "5xK...",
  "data": { ... }
}
```

### 2. `get_wallet_balance`

Get the balance of a Solana wallet.

**Parameters:**
- `walletAddress` (string, required) - Solana public key

**Example:**

```typescript
await mcp.callTool('get_wallet_balance', {
  walletAddress: 'YourSolanaPublicKey...'
});
```

### 3. `create_agent_wallet`

Create a managed agent wallet with spending limits.

**Parameters:**
- `name` (string, required) - Agent name
- `spendingLimitDaily` (number) - Daily spending limit in USDC
- `allowedServices` (array) - Whitelist of allowed endpoints

### 4. `get_agent_info`

Get information about the current agent wallet including reputation.

## Usage Example

### With Claude Desktop

1. Install the MCP server
2. Configure Claude Desktop with the server
3. Ask Claude to use paid APIs:

```
User: "Can you get me the latest crypto prices from the premium API at
       http://localhost:3000/api/crypto-price?"

Claude: I'll use the 402pay MCP server to make that paid request.

[Claude calls make_paid_request tool]
[Payment is made automatically]
[Data is returned]

Claude: "Here are the latest crypto prices..."
```

## How It Works

1. **Agent requests data** - AI agent wants to call a paid API
2. **Server intercepts 402** - MCP server detects payment requirement
3. **Automatic payment** - Creates and sends Solana transaction
4. **Retry with proof** - Retries request with X-PAYMENT header
5. **Return data** - Agent receives the paid content seamlessly

## Features

- **Transparent payments** - Agent doesn't need to understand blockchain
- **Spending limits** - Set daily/per-transaction limits
- **Service whitelisting** - Only allow specific APIs
- **Reputation tracking** - Build trust score over time
- **Multi-token support** - USDC, SOL, USDT, PYUSD

## Security

- Wallet private keys stored securely in environment
- Spending limits prevent runaway costs
- Service whitelisting prevents unauthorized API calls
- All transactions logged for audit

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Start
npm start
```

## License

MIT
