# Railway Configuration Files

This directory contains Railway deployment configuration and templates for 402pay.

## 📁 Files

### `facilitator.env.template`
Environment variables template for the Facilitator API service. Copy these variables to your Railway dashboard under the `facilitator-api` service.

**Key Variables:**
- Database connection (auto-provided by Railway)
- Redis connection (auto-provided by Railway)
- Solana network configuration
- CORS settings
- Rate limiting
- Security secrets

### `dashboard.env.template`
Environment variables template for the Dashboard (Next.js) service. Copy these variables to your Railway dashboard under the `dashboard` service.

**Key Variables:**
- Facilitator API URL (reference to facilitator-api service)
- Solana network configuration
- Public API endpoints
- Optional analytics and feature flags

### `setup.sh`
Automated setup script to help you get started with Railway deployment.

**Usage:**
```bash
cd 402pay
./.railway/setup.sh
```

This script will:
1. Check if Railway CLI is installed (installs if missing)
2. Log you into Railway
3. Initialize or link your Railway project
4. Provide next steps for deployment

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Run the setup script
./.railway/setup.sh

# Follow the prompts and on-screen instructions
```

### Option 2: Manual Setup

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Create/Link Project**
   ```bash
   # Create new project
   railway init

   # OR link existing project
   railway link
   ```

4. **Follow the deployment guide**
   - See [RAILWAY_DEPLOYMENT.md](../RAILWAY_DEPLOYMENT.md) for full instructions
   - See [RAILWAY_QUICK_START.md](../RAILWAY_QUICK_START.md) for 10-minute setup

## 📋 Service Configuration

### Facilitator API

**Build Settings:**
- **Root Directory**: `/`
- **Dockerfile Path**: `packages/facilitator/Dockerfile`
- **Port**: `3001`

**Required Services:**
- PostgreSQL database
- Redis cache

**Environment Variables:**
- See `facilitator.env.template`
- Must add references to PostgreSQL and Redis services

### Dashboard

**Build Settings:**
- **Root Directory**: `/`
- **Build Command**:
  ```bash
  pnpm install && pnpm --filter @402pay/shared build && pnpm --filter @402pay/sdk build && pnpm --filter @402pay/dashboard build
  ```
- **Start Command**:
  ```bash
  cd apps/dashboard && pnpm start
  ```
- **Install Command**:
  ```bash
  npm install -g pnpm && pnpm install
  ```
- **Port**: `3000`

**Required Services:**
- Facilitator API (for API calls)

**Environment Variables:**
- See `dashboard.env.template`
- Must add reference to facilitator-api service

## 🔗 Service References

Railway allows services to reference each other using variables:

### Example: Connect Facilitator to Database

In facilitator-api service:
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
```

### Example: Connect Dashboard to Facilitator

In dashboard service:
```bash
NEXT_PUBLIC_FACILITATOR_URL=https://${{facilitator-api.RAILWAY_PUBLIC_DOMAIN}}
```

## 🗄️ Database Setup

After deploying the facilitator-api, run migrations:

```bash
# Using Railway CLI
railway service facilitator-api
railway run pnpm --filter @402pay/facilitator prisma migrate deploy
railway run pnpm --filter @402pay/facilitator prisma generate
```

Or use Railway Dashboard → Service → Settings → One-off Command:
```bash
cd packages/facilitator && npx prisma migrate deploy && npx prisma generate
```

## 🔐 Security Notes

1. **Never commit `.env` files** - Use Railway's secure variable storage
2. **Generate strong secrets** - Use `openssl rand -base64 32` for JWT_SECRET
3. **Configure CORS** - Only allow your Railway domains
4. **Use service references** - Leverage Railway's internal networking
5. **Rotate secrets regularly** - Update JWT_SECRET and API keys periodically

## 📊 Monitoring

### View Logs

```bash
# Facilitator logs
railway service facilitator-api
railway logs --follow

# Dashboard logs
railway service dashboard
railway logs --follow
```

### Check Service Status

```bash
railway status
```

### View Metrics

Go to Railway Dashboard → Service → Metrics tab

## 💡 Pro Tips

1. **Use devnet for testing** - Free Solana transactions
2. **Pause unused services** - Save Railway credits
3. **Monitor usage** - Check Railway dashboard regularly
4. **Set up custom domains** - Professional URLs
5. **Enable auto-deployments** - Push to GitHub = automatic deployment
6. **Use Railway's private network** - Faster internal service communication

## 🚨 Common Issues

### Build fails with "Cannot find module"

**Solution**: Ensure shared packages are built first in build command:
```bash
pnpm --filter @402pay/shared build && pnpm --filter @402pay/sdk build && ...
```

### Database connection errors

**Solution**: Verify DATABASE_URL reference is correctly set to PostgreSQL service

### Port already in use

**Solution**: Railway auto-assigns ports. Ensure your code uses `process.env.PORT`

### Prisma Client not generated

**Solution**: Run migrations after deployment:
```bash
railway run npx prisma generate
```

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [402pay Full Deployment Guide](../RAILWAY_DEPLOYMENT.md)
- [402pay Quick Start](../RAILWAY_QUICK_START.md)
- [402pay Main README](../README.md)

## 🆘 Support

- **Railway Help**: [discord.gg/railway](https://discord.gg/railway)
- **402pay Issues**: [GitHub Issues](https://github.com/yourusername/402pay/issues)
- **Email**: support@402pay.io

---

**Happy deploying! 🚂**
