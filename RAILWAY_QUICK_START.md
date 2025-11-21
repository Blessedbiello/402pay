# 🚂 Railway Quick Start - 402pay

Deploy your complete 402pay platform to Railway in **under 10 minutes**.

## Prerequisites

- GitHub account with 402pay repository
- Railway account (sign up at [railway.app](https://railway.app))

## 🎯 One-Click Setup (Fastest)

### Step 1: Create Railway Project

1. Go to [railway.app/new](https://railway.app/new)
2. Click **"New Project"**
3. Click **"Deploy from GitHub repo"**
4. Select your **402pay** repository
5. Railway creates a new project

### Step 2: Add Databases (2 minutes)

**Add PostgreSQL:**
1. In your project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Done! `DATABASE_URL` is now available

**Add Redis:**
1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. Done! `REDIS_URL` is now available

### Step 3: Deploy Facilitator API (3 minutes)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your **402pay** repository
3. Railway detects the repository

**Configure Service:**
- **Service Name**: `facilitator-api`
- **Root Directory**: Leave blank (uses repo root)
- Go to **Settings** → **"Build"**:
  - **Builder**: Dockerfile
  - **Dockerfile Path**: `packages/facilitator/Dockerfile`

**Add Environment Variables:**
Click **"Variables"** tab and add:

```bash
NODE_ENV=production
PORT=3001
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
PAYMENT_RECIPIENT_ADDRESS=<YOUR_SOLANA_WALLET>
JWT_SECRET=<GENERATE_RANDOM_SECRET>
LOG_LEVEL=info
ENABLE_METRICS=true
```

**Add Service References:**
1. Click **"+ New Variable"** → **"Add Reference"**
2. Select **Postgres** → `DATABASE_URL`
3. Click **"+ New Variable"** → **"Add Reference"**
4. Select **Redis** → `REDIS_URL`

**Enable Public Access:**
1. Go to **Settings** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://facilitator-api-production-xxxx.up.railway.app`)

Click **"Deploy"**

### Step 4: Run Database Migrations (1 minute)

**Option A: Using Railway Dashboard**
1. Go to **facilitator-api** service
2. Click **"Settings"** → **"Deploy"** → **"One-off Command"**
3. Run: `cd packages/facilitator && npx prisma migrate deploy && npx prisma generate`

**Option B: Using Railway CLI**
```bash
# Install Railway CLI (if not already installed)
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Select facilitator-api service
railway service facilitator-api

# Run migrations
railway run pnpm --filter @402pay/facilitator prisma migrate deploy
railway run pnpm --filter @402pay/facilitator prisma generate
```

### Step 5: Deploy Dashboard (3 minutes)

1. Click **"+ New"** → **"GitHub Repo"**
2. Select your **402pay** repository

**Configure Service:**
- **Service Name**: `dashboard`
- **Root Directory**: Leave blank

Go to **Settings** → **"Build"**:
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

**Add Environment Variables:**
```bash
NODE_ENV=production
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

**Add Service Reference:**
1. Click **"+ New Variable"** → **"Add Reference"**
2. Select **facilitator-api** → `RAILWAY_PUBLIC_DOMAIN`
3. Name it: `NEXT_PUBLIC_FACILITATOR_URL`
4. Add prefix: `https://`

**Enable Public Access:**
1. Go to **Settings** → **"Networking"**
2. Click **"Generate Domain"**

Click **"Deploy"**

## ✅ Verify Deployment

### Test Facilitator API

```bash
# Health check
curl https://your-facilitator-url.railway.app/health

# Expected: {"status":"healthy","timestamp":1234567890}

# Test x402 endpoint
curl https://your-facilitator-url.railway.app/x402/paid-greeting

# Expected: 402 Payment Required response
```

### Test Dashboard

Open your dashboard URL in a browser:
```
https://your-dashboard-url.railway.app
```

You should see the 402pay dashboard homepage.

## 🎨 Your Railway Project Structure

After setup, your Railway project will look like this:

```
402pay-project
├── 📦 Postgres (Database)
│   └── DATABASE_URL (auto-generated)
├── 📦 Redis (Cache)
│   └── REDIS_URL (auto-generated)
├── 🚀 facilitator-api (Express API)
│   ├── Dockerfile: packages/facilitator/Dockerfile
│   ├── PORT: 3001
│   └── URL: facilitator-api-production-xxxx.up.railway.app
└── 🎨 dashboard (Next.js)
    ├── Build: pnpm commands
    ├── PORT: 3000
    └── URL: dashboard-production-xxxx.up.railway.app
```

## 🔄 Continuous Deployment

Railway automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "feat: new payment feature"
git push origin main
```

Railway will automatically:
1. Detect the push
2. Build your services
3. Deploy updates
4. Show real-time logs

## 🔧 Update Environment Variables

To update any environment variable:

1. Go to Railway dashboard
2. Select the service
3. Click **"Variables"** tab
4. Click **"+ New Variable"** or edit existing
5. Save changes
6. Railway will automatically redeploy

## 📊 Monitor Your Services

### View Logs

**In Railway Dashboard:**
1. Click on a service
2. Go to **"Logs"** tab
3. Watch real-time logs

**Using Railway CLI:**
```bash
# View facilitator logs
railway service facilitator-api
railway logs --follow

# View dashboard logs
railway service dashboard
railway logs --follow
```

### Check Metrics

Railway provides built-in metrics:
- **CPU Usage**
- **Memory Usage**
- **Network Traffic**

Access via service → **"Metrics"** tab

## 🚨 Troubleshooting

### Service won't start?

1. Check **Logs** tab for errors
2. Verify environment variables are set correctly
3. Ensure service references are connected
4. Check that migrations ran successfully

### Database connection error?

1. Verify `DATABASE_URL` reference is set
2. Check PostgreSQL service is running
3. Run migrations again

### Build failures?

1. Check build logs in Railway dashboard
2. Ensure all dependencies are in `package.json`
3. Verify Dockerfile paths are correct

## 💰 Cost Estimate (Free Tier)

Railway gives you **$5/month** free credit:

- **Facilitator API**: ~$2-3/month (always running)
- **Dashboard**: ~$1-2/month (always running)
- **PostgreSQL**: Included (up to 500MB)
- **Redis**: Included (up to 100MB)

**Total**: Fits within free tier for demo/testing

To reduce costs:
- Use devnet (no transaction fees)
- Pause services when not demoing
- Monitor usage in Railway dashboard

## 🎓 Next Steps

1. **Configure Payment Address**: Update `PAYMENT_RECIPIENT_ADDRESS` with your Solana wallet
2. **Secure JWT**: Generate strong `JWT_SECRET` using `openssl rand -base64 32`
3. **Test Payments**: Try the x402 demo endpoints
4. **Explore Dashboard**: Visit marketplace, analytics, agents
5. **Custom Domain**: Add your domain in Railway settings (optional)

## 📖 Full Documentation

For advanced configuration, see:
- [Complete Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md)
- [402pay Documentation](./README.md)
- [Railway Documentation](https://docs.railway.app)

## 🆘 Need Help?

- **Railway Issues**: [Railway Discord](https://discord.gg/railway)
- **402pay Issues**: [GitHub Issues](https://github.com/yourusername/402pay/issues)
- **Email**: support@402pay.io

---

**🎉 That's it! Your 402pay platform is now live on Railway!**

Test it out:
```bash
# Get your URLs
echo "Facilitator: https://$(railway service facilitator-api && railway domain)"
echo "Dashboard: https://$(railway service dashboard && railway domain)"
```
