# 402pay Dashboard

Stripe-like web dashboard for monitoring x402 payments, revenue, and analytics.

## Features

- **Revenue Overview** - Real-time revenue metrics (today, week, month, total)
- **Transaction History** - View all payment transactions
- **Active Subscriptions** - Monitor recurring billing
- **Agent Management** - Track AI agent activity and reputation
- **API Keys** - Manage authentication keys
- **Analytics** - Charts and insights

## Quick Start

### Install Dependencies

```bash
npm install
```

### Configure Environment

```bash
cp .env.example .env.local
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

### Dashboard (/)
- Revenue stats cards
- 7-day revenue chart
- Recent transactions list
- Quick stats overview

### Transactions (/transactions)
- Full transaction history
- Filter by status, date, agent
- Export to CSV

### Subscriptions (/subscriptions)
- Active subscription plans
- Usage metrics
- Billing cycles

### Agents (/agents)
- Agent wallet list
- Reputation scores
- Spending limits
- Transaction history per agent

### API Keys (/api-keys)
- Create new API keys
- Manage permissions
- View usage stats

### Analytics (/analytics)
- Revenue trends
- Top agents by volume
- Geographic distribution
- API performance

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **date-fns** - Date formatting
- **@402pay/sdk** - Payment integration

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

```bash
vercel
```

### Docker

```bash
docker build -t 402pay-dashboard .
docker run -p 3000:3000 402pay-dashboard
```

## Environment Variables

```env
NEXT_PUBLIC_FACILITATOR_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_NETWORK=devnet
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

MIT
