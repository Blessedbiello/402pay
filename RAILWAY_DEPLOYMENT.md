# Railway Deployment Guide for 402pay

This guide will help you deploy the complete 402pay platform (Facilitator API + Dashboard + PostgreSQL + Redis) on Railway's free tier in a seamless, unified setup.

## 🎯 Overview

Railway provides a complete platform for deploying your entire 402pay stack:

- **Facilitator API** (Express backend)
- **Dashboard** (Next.js 15 frontend)
- **PostgreSQL** (Database)
- **Redis** (Cache)

All services communicate internally via Railway's private networking - no external services needed!

## 📊 Railway Free Tier

- **$5/month** in free credits (enough for demos)
- **PostgreSQL**: 500MB storage
- **Redis**: 100MB storage
- **Compute**: Shared CPU, 512MB RAM per service
- **No credit card required** for initial setup

## 🚀 Quick Start

### Step 1: Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app) using your GitHub account
3. **Railway CLI** (optional) - For command-line deployment
   ```bash
   npm install -g @railway/cli
   railway login
   ```

### Step 2: Create Railway Project

#### Option A: Using Railway Dashboard (Recommended)

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `402pay` repository
5. Railway will create an empty project

#### Option B: Using Railway CLI

```bash
# In your 402pay directory
railway init
railway link
```

### Step 3: Add Services to Railway Project

You'll add 4 services to your Railway project:

#### 3.1 Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will automatically provision a PostgreSQL instance
4. **Note**: Railway will create a `DATABASE_URL` variable automatically

#### 3.2 Add Redis Cache

1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. Railway will automatically provision a Redis instance
4. **Note**: Railway will create a `REDIS_URL` variable automatically

#### 3.3 Deploy Facilitator API

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your `402pay` repository (if not already connected)
3. Railway will detect the repository
4. Configure the service:
   - **Service Name**: `facilitator-api`
   - **Root Directory**: `/` (monorepo root)
   - **Dockerfile Path**: `packages/facilitator/Dockerfile`
   - **Build Command**: (leave empty, Docker handles it)
   - **Start Command**: (leave empty, Dockerfile CMD handles it)

5. Add environment variables (see section below)
6. Click **"Deploy"**

#### 3.4 Deploy Dashboard (Next.js)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select the same `402pay` repository
3. Configure the service:
   - **Service Name**: `dashboard`
   - **Root Directory**: `/` (monorepo root)
   - **Build Command**: `pnpm install && pnpm --filter @402pay/shared build && pnpm --filter @402pay/sdk build && pnpm --filter @402pay/dashboard build`
   - **Start Command**: `cd apps/dashboard && pnpm start`
   - **Install Command**: `npm install -g pnpm && pnpm install`

5. Add environment variables (see section below)
6. Click **"Deploy"**

## 🔧 Environment Variables Configuration

### Facilitator API Environment Variables

Add these in the Railway dashboard under the **facilitator-api** service:

```bash
# Server
NODE_ENV=production
PORT=3001

# Database (automatically provided by Railway PostgreSQL service)
# DATABASE_URL will be auto-populated when you reference the PostgreSQL service

# Redis (automatically provided by Railway Redis service)
# REDIS_URL will be auto-populated when you reference the Redis service

# Solana Network
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com

# Payment Configuration
PAYMENT_RECIPIENT_ADDRESS=YourSolanaWalletAddressHere

# CORS (Update with your Railway dashboard URL)
ALLOWED_ORIGINS=${{RAILWAY_PUBLIC_DOMAIN}},${{Dashboard.RAILWAY_PUBLIC_DOMAIN}}

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this

# Rate Limiting
PUBLIC_RATE_LIMIT=100
AUTH_RATE_LIMIT=200
VERIFY_RATE_LIMIT=50

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true

# API Keys
API_KEY_PREFIX=rw_live_
```

### Dashboard Environment Variables

Add these in the Railway dashboard under the **dashboard** service:

```bash
# Next.js
NODE_ENV=production
NEXT_PUBLIC_API_URL=${{facilitator-api.RAILWAY_PUBLIC_DOMAIN}}

# Solana
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Facilitator URL (internal reference)
NEXT_PUBLIC_FACILITATOR_URL=https://${{facilitator-api.RAILWAY_PUBLIC_DOMAIN}}
```

## 🔗 Service References in Railway

Railway allows services to reference each other using variables:

### Connect Facilitator to PostgreSQL

In **facilitator-api** service variables:
1. Click **"+ New Variable"** → **"Add Reference"**
2. Select **PostgreSQL** service
3. Choose `DATABASE_URL`
4. Railway will create: `DATABASE_URL=${{Postgres.DATABASE_URL}}`

### Connect Facilitator to Redis

In **facilitator-api** service variables:
1. Click **"+ New Variable"** → **"Add Reference"**
2. Select **Redis** service
3. Choose `REDIS_URL`
4. Railway will create: `REDIS_URL=${{Redis.REDIS_URL}}`

### Connect Dashboard to Facilitator

In **dashboard** service variables:
1. Click **"+ New Variable"** → **"Add Reference"**
2. Select **facilitator-api** service
3. Choose `RAILWAY_PUBLIC_DOMAIN`
4. Use in `NEXT_PUBLIC_FACILITATOR_URL=https://${{facilitator-api.RAILWAY_PUBLIC_DOMAIN}}`

## 🗄️ Database Setup

After the Facilitator API is deployed, you need to run Prisma migrations:

### Using Railway CLI

```bash
# Link to your Railway project
railway link

# Select the facilitator-api service
railway service facilitator-api

# Run migrations
railway run pnpm --filter @402pay/facilitator prisma migrate deploy

# Generate Prisma Client
railway run pnpm --filter @402pay/facilitator prisma generate

# (Optional) Seed initial data
railway run pnpm --filter @402pay/facilitator prisma db seed
```

### Using Railway Dashboard Shell

1. Go to your **facilitator-api** service
2. Click on **"Settings"** → **"Deploy"** → **"One-off Command"**
3. Run these commands one by one:
   ```bash
   cd packages/facilitator && npx prisma migrate deploy
   cd packages/facilitator && npx prisma generate
   ```

## 🌐 Accessing Your Deployment

After deployment, Railway provides public URLs for each service:

- **Facilitator API**: `https://facilitator-api-production-xxxx.up.railway.app`
- **Dashboard**: `https://dashboard-production-xxxx.up.railway.app`

You can find these URLs in each service's **Settings** → **"Public Networking"** section.

### Enable Public Networking

By default, services may not have public URLs. To enable:

1. Go to service **Settings**
2. Scroll to **"Public Networking"**
3. Click **"Generate Domain"**
4. Railway will assign a public URL

## 📦 Deployment Workflow

### Automatic Deployments

Railway automatically deploys when you push to your GitHub repository:

```bash
git add .
git commit -m "feat: update payment flow"
git push origin main
```

Railway will:
1. Detect the push
2. Build your services
3. Deploy automatically
4. Show build logs in real-time

### Manual Deployments

Using Railway CLI:

```bash
# Deploy facilitator-api
railway service facilitator-api
railway up

# Deploy dashboard
railway service dashboard
railway up
```

## 🔍 Monitoring & Debugging

### View Logs

```bash
# View facilitator logs
railway service facilitator-api
railway logs

# View dashboard logs
railway service dashboard
railway logs

# Follow logs in real-time
railway logs --follow
```

### Debugging Tips

1. **Build Failures**: Check Railway build logs for errors
2. **Runtime Errors**: View service logs in Railway dashboard
3. **Database Issues**: Ensure migrations ran successfully
4. **Connection Issues**: Verify service references are correct

### Health Checks

Test your deployment:

```bash
# Check facilitator health
curl https://your-facilitator-url.railway.app/health

# Check dashboard
curl https://your-dashboard-url.railway.app

# Test x402 endpoint
curl https://your-facilitator-url.railway.app/x402/paid-greeting
```

## 🔐 Security Best Practices

### Environment Variables

- ✅ Use Railway's built-in secrets for sensitive data
- ✅ Never commit `.env` files to GitHub
- ✅ Rotate `JWT_SECRET` regularly
- ✅ Use strong, random API keys

### CORS Configuration

Update `ALLOWED_ORIGINS` to include only your domains:

```bash
ALLOWED_ORIGINS=https://your-dashboard.railway.app,https://your-app.com
```

### Database Security

- ✅ Railway PostgreSQL uses SSL by default
- ✅ Database is only accessible within Railway private network
- ✅ Use connection pooling (Prisma handles this)

## 🎯 Production Checklist

Before going live:

- [ ] Update `SOLANA_NETWORK` to `mainnet-beta`
- [ ] Update `SOLANA_RPC_URL` to a paid RPC provider (QuickNode, Helius)
- [ ] Set a strong `JWT_SECRET`
- [ ] Configure `ALLOWED_ORIGINS` with your production domains
- [ ] Add your real `PAYMENT_RECIPIENT_ADDRESS`
- [ ] Run database migrations
- [ ] Test all endpoints
- [ ] Enable Railway's built-in metrics
- [ ] Set up alerts for service downtime

## 💡 Pro Tips

### Cost Optimization

Railway free tier gives you $5/month. To stay within limits:

1. **Use devnet** for testing (free transactions)
2. **Scale down** when not actively demoing
3. **Monitor usage** in Railway dashboard
4. **Pause services** you're not using

### Monorepo Support

Railway handles monorepos well. Key points:

- Set **Root Directory** to `/` (repository root)
- Use **pnpm workspaces** (already configured)
- Reference workspace packages: `@402pay/shared`, `@402pay/sdk`
- Build dependencies before main service

### Custom Domains

To use your own domain (e.g., `api.402pay.io`):

1. Go to service **Settings** → **"Public Networking"**
2. Click **"Custom Domain"**
3. Add your domain
4. Update DNS records as instructed
5. Railway handles SSL automatically

## 🚨 Troubleshooting

### Issue: "Cannot find module '@402pay/shared'"

**Solution**: Ensure shared packages are built before the main service.

Update build command to:
```bash
pnpm --filter @402pay/shared build && pnpm --filter @402pay/sdk build && pnpm --filter @402pay/facilitator build
```

### Issue: "DATABASE_URL is not defined"

**Solution**: Connect PostgreSQL service using Railway references.

1. Add reference to PostgreSQL service
2. Restart facilitator-api service

### Issue: "Port 3000 is already in use"

**Solution**: Railway automatically assigns ports. Use `process.env.PORT` in your code.

Facilitator already uses:
```typescript
const PORT = process.env.PORT || 3001;
```

### Issue: Prisma migrations fail

**Solution**: Run migrations manually using Railway CLI or dashboard shell.

```bash
railway service facilitator-api
railway run npx prisma migrate deploy
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Templates](https://railway.app/templates)
- [Railway Discord](https://discord.gg/railway)
- [402pay Documentation](./README.md)
- [Prisma with Railway](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

## 🆘 Support

If you encounter issues:

1. Check Railway [status page](https://status.railway.app/)
2. Review Railway [build logs](https://railway.app/project)
3. Ask in Railway [Discord](https://discord.gg/railway)
4. Open an issue in [402pay GitHub](https://github.com/yourusername/402pay/issues)

---

**Happy Deploying! 🚀**

Your 402pay platform will be live in minutes with Railway's seamless deployment.
