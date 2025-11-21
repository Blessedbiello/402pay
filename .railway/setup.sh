#!/bin/bash

# 402pay Railway Deployment Setup Script
# This script helps you set up your Railway deployment

set -e

echo "🚂 402pay Railway Deployment Setup"
echo "===================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found"
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    echo "✅ Railway CLI installed"
else
    echo "✅ Railway CLI found"
fi

echo ""
echo "🔐 Logging in to Railway..."
railway login

echo ""
echo "📁 Current directory: $(pwd)"
echo ""

# Check if already linked to a Railway project
if railway status &> /dev/null; then
    echo "✅ Already linked to a Railway project"
    railway status
else
    echo "🔗 No Railway project linked"
    echo ""
    echo "Choose an option:"
    echo "1. Create a new Railway project"
    echo "2. Link to an existing Railway project"
    read -p "Enter choice (1 or 2): " choice

    if [ "$choice" = "1" ]; then
        echo "🆕 Creating new Railway project..."
        railway init
    elif [ "$choice" = "2" ]; then
        echo "🔗 Linking to existing Railway project..."
        railway link
    else
        echo "❌ Invalid choice"
        exit 1
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1️⃣  Add PostgreSQL database:"
echo "   - Go to railway.app and open your project"
echo "   - Click '+ New' → 'Database' → 'Add PostgreSQL'"
echo ""
echo "2️⃣  Add Redis cache:"
echo "   - Click '+ New' → 'Database' → 'Add Redis'"
echo ""
echo "3️⃣  Deploy Facilitator API:"
echo "   - Click '+ New' → 'GitHub Repo' → Select '402pay'"
echo "   - Name: facilitator-api"
echo "   - Root Directory: /"
echo "   - Dockerfile Path: packages/facilitator/Dockerfile"
echo "   - Add environment variables from: .railway/facilitator.env.template"
echo "   - Add references: DATABASE_URL and REDIS_URL"
echo ""
echo "4️⃣  Deploy Dashboard:"
echo "   - Click '+ New' → 'GitHub Repo' → Select '402pay'"
echo "   - Name: dashboard"
echo "   - Root Directory: /"
echo "   - Build Command: pnpm install && pnpm --filter @402pay/shared build && pnpm --filter @402pay/sdk build && pnpm --filter @402pay/dashboard build"
echo "   - Start Command: cd apps/dashboard && pnpm start"
echo "   - Add environment variables from: .railway/dashboard.env.template"
echo ""
echo "5️⃣  Run database migrations:"
echo "   railway service facilitator-api"
echo "   railway run pnpm --filter @402pay/facilitator prisma migrate deploy"
echo "   railway run pnpm --filter @402pay/facilitator prisma generate"
echo ""
echo "📖 Full guide: See RAILWAY_DEPLOYMENT.md"
echo ""
