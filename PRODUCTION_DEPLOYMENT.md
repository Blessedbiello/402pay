# Production Deployment Guide

## Overview

This guide covers deploying 402pay to production after applying all Priority 1 and Priority 2 security fixes. Follow these steps carefully to ensure a secure, reliable deployment.

**Prerequisites:**
- Node.js 18+ installed
- PostgreSQL 16+ database
- Redis 7+ instance
- Solana wallet with SOL/USDC
- Domain with SSL certificate

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Build & Deploy](#build--deploy)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Rollback Procedures](#rollback-procedures)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### ✅ Required Infrastructure

- [ ] PostgreSQL database provisioned (recommended: 2 vCPU, 4GB RAM minimum)
- [ ] Redis instance configured (recommended: 1GB memory minimum)
- [ ] Application server (recommended: 2 vCPU, 4GB RAM minimum)
- [ ] SSL certificate for domain
- [ ] Solana RPC endpoint (paid tier recommended: Helius, QuickNode, Alchemy)
- [ ] Secrets manager (AWS Secrets Manager, HashiCorp Vault, or similar)
- [ ] Log aggregation service (DataDog, New Relic, CloudWatch, or self-hosted)

### ✅ Security Hardening

- [ ] Generated strong JWT secret (32+ characters)
- [ ] Configured firewall rules (whitelist only necessary IPs)
- [ ] Database uses SSL/TLS connections
- [ ] Redis requires authentication
- [ ] Rate limiting configured for expected load
- [ ] CORS origins explicitly whitelisted (no wildcards)

### ✅ Code Preparation

- [ ] All tests passing (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Dependencies audited (`pnpm audit`)
- [ ] Git branch merged to main/production branch

---

## Database Setup

### 1. Provision PostgreSQL Database

#### AWS RDS Example:
```bash
aws rds create-db-instance \
  --db-instance-identifier 402pay-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 16.1 \
  --master-username admin \
  --master-user-password <STRONG_PASSWORD> \
  --allocated-storage 100 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --publicly-accessible false \
  --vpc-security-group-ids sg-xxxxx
```

#### Neon (Serverless) Example:
```bash
# Create project via Neon Console
# Copy connection string
```

#### Self-Hosted Docker:
```bash
docker run -d \
  --name 402pay-postgres \
  -e POSTGRES_USER=402pay \
  -e POSTGRES_PASSWORD=<STRONG_PASSWORD> \
  -e POSTGRES_DB=402pay_prod \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

### 2. Run Database Migrations

```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://user:password@host:5432/402pay_prod"

# Navigate to facilitator package
cd packages/facilitator

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# Verify migration status
pnpm prisma migrate status
```

### 3. Create Database Indexes (Performance)

The migrations include all performance indexes. Verify:

```bash
pnpm prisma db execute --stdin <<SQL
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM
  pg_indexes
WHERE
  schemaname = 'public'
ORDER BY
  tablename,
  indexname;
SQL
```

Expected indexes:
- ApiKey: `userId`, `key`, `userId_revoked`, `revoked_expiresAt`
- Transaction: `payer_timestamp`, `recipient_status`, `timestamp_status`, `agentId_timestamp`
- JobRequest: `status_createdAt`, `clientAgentId_status`, `providerAgentId_status`
- AgentService: `category_isActive`, `isActive_totalEarnings`, `isActive_priceAmount`

### 4. Seed Marketplace Data (Optional)

```bash
# Create initial API key for seeding
curl -X POST https://your-api.example.com/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Key",
    "userId": "admin",
    "environment": "live",
    "permissions": ["read", "write", "admin"]
  }'

# Use returned key to seed marketplace
curl -X POST https://your-api.example.com/marketplace/seed \
  -H "x-api-key: sk_xxxxx"
```

---

## Environment Configuration

### 1. Create Production Environment File

**DO NOT use .env file in production. Use secrets manager instead.**

#### AWS Secrets Manager Example:

```bash
# Store secrets
aws secretsmanager create-secret \
  --name 402pay/prod/env \
  --secret-string '{
    "DATABASE_URL": "postgresql://...",
    "REDIS_URL": "redis://...",
    "JWT_SECRET": "...",
    "ALLOWED_ORIGINS": "https://dashboard.example.com",
    "SOLANA_RPC_URL": "https://mainnet.helius-rpc.com/?api-key=...",
    "SOLANA_NETWORK": "mainnet-beta"
  }'

# Retrieve in application startup
aws secretsmanager get-secret-value \
  --secret-id 402pay/prod/env \
  --query SecretString \
  --output text | jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' > .env
```

#### HashiCorp Vault Example:

```bash
# Write secrets
vault kv put secret/402pay/prod \
  database_url="postgresql://..." \
  redis_url="redis://..." \
  jwt_secret="..." \
  allowed_origins="https://dashboard.example.com"

# Read in application
vault kv get -format=json secret/402pay/prod | jq -r '.data.data | to_entries[] | "\(.key)=\(.value)"' > .env
```

### 2. Required Environment Variables

```bash
# Critical (must be set)
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
ALLOWED_ORIGINS=https://dashboard.example.com,https://api.example.com
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Redis (recommended)
REDIS_URL=redis://user:password@host:6379

# Security
JWT_SECRET=<generate with: openssl rand -hex 32>

# Rate Limiting (tune based on load)
PUBLIC_RATE_LIMIT=1000
AUTH_RATE_LIMIT=2000
VERIFY_RATE_LIMIT=500

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

### 3. Validate Configuration

```bash
# Test database connection
pnpm prisma db execute --stdin <<< "SELECT 1"

# Test Redis connection
redis-cli -u $REDIS_URL ping

# Verify Solana RPC
curl $SOLANA_RPC_URL -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

---

## Build & Deploy

### Option 1: Docker Deployment

```bash
# Build image
docker build -t 402pay-facilitator:latest -f packages/facilitator/Dockerfile .

# Run container
docker run -d \
  --name 402pay-facilitator \
  --env-file .env \
  -p 3001:3001 \
  --restart unless-stopped \
  --health-cmd 'curl -f http://localhost:3001/health || exit 1' \
  --health-interval 30s \
  --health-timeout 3s \
  --health-retries 3 \
  402pay-facilitator:latest

# Check logs
docker logs -f 402pay-facilitator
```

### Option 2: PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Build application
pnpm --filter @402pay/facilitator build

# Start with PM2
pm2 start packages/facilitator/dist/index.js \
  --name 402pay-facilitator \
  --instances 2 \
  --env production

# Save PM2 config
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Option 3: Systemd Service

```bash
# Create service file: /etc/systemd/system/402pay.service
cat > /etc/systemd/system/402pay.service <<EOF
[Unit]
Description=402pay Facilitator
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=402pay
WorkingDirectory=/opt/402pay
EnvironmentFile=/opt/402pay/.env
ExecStart=/usr/bin/node packages/facilitator/dist/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
systemctl enable 402pay
systemctl start 402pay

# Check status
systemctl status 402pay
```

### Option 4: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: 402pay-facilitator
spec:
  replicas: 3
  selector:
    matchLabels:
      app: 402pay-facilitator
  template:
    metadata:
      labels:
        app: 402pay-facilitator
    spec:
      containers:
      - name: facilitator
        image: 402pay-facilitator:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        envFrom:
        - secretRef:
            name: 402pay-secrets
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Basic health
curl https://api.example.com/health
# Expected: {"status":"ok","service":"402pay-facilitator","version":"0.1.0"}

# Metrics endpoint
curl https://api.example.com/metrics
# Should return Prometheus metrics

# Test authentication
curl https://api.example.com/analytics \
  -H "x-api-key: invalid"
# Expected: 401 Unauthorized
```

### 2. Functional Tests

```bash
# Create test API key
curl -X POST https://api.example.com/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Key",
    "userId": "test-user",
    "environment": "test"
  }'

# List marketplace services
curl https://api.example.com/marketplace/services

# Verify CORS is working
curl -H "Origin: https://dashboard.example.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Api-Key" \
  -X OPTIONS https://api.example.com/verify
```

### 3. Database Verification

```bash
# Check service count
pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM agent_services"

# Verify indexes exist
pnpm prisma db execute --stdin <<< "SELECT indexname FROM pg_indexes WHERE tablename='transactions'"

# Check for orphaned data
pnpm prisma db execute --stdin <<< "SELECT COUNT(*) FROM job_requests WHERE service_id NOT IN (SELECT id FROM agent_services)"
```

### 4. Monitor Logs

```bash
# Check for errors
tail -f /var/log/402pay/error.log | grep -i error

# Monitor access logs
tail -f /var/log/402pay/access.log

# Check for CORS blocks
tail -f /var/log/402pay/access.log | grep "CORS request blocked"
```

---

## Monitoring & Maintenance

### 1. Prometheus Metrics

Configure Prometheus to scrape `/metrics` endpoint:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: '402pay-facilitator'
    static_configs:
      - targets: ['api.example.com:3001']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### 2. Grafana Dashboards

Import pre-built dashboards for:
- Request rate and latency
- Payment verification success/failure rates
- Database connection pool usage
- Redis hit/miss rates
- Error rates by endpoint

### 3. Alerts

Set up alerts for:
- Health check failures (> 1 minute downtime)
- Error rate > 1%
- Database connection pool exhausted
- Redis unavailable
- Payment verification failures > 5%
- Disk space < 20%

### 4. Log Aggregation

Configure structured logging:

```javascript
// In production, logs should go to stdout (for container logs)
// or to a log aggregation service

// Example: Send to DataDog
const winston = require('winston');
const { datadogTransport } = require('@datadog/winston');

logger.add(datadogTransport({
  apiKey: process.env.DATADOG_API_KEY,
  service: '402pay-facilitator',
  ddsource: 'nodejs',
  ddtags: `env:production,version:${version}`,
}));
```

### 5. Backup Strategy

```bash
# Automated PostgreSQL backups (daily)
pg_dump $DATABASE_URL | gzip > backup-$(date +%Y%m%d).sql.gz

# Upload to S3
aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://402pay-backups/

# Retention: 7 daily, 4 weekly, 12 monthly
```

---

## Rollback Procedures

### 1. Application Rollback

```bash
# Docker
docker stop 402pay-facilitator
docker run -d --name 402pay-facilitator 402pay-facilitator:previous-version

# PM2
pm2 stop 402pay-facilitator
pm2 start previous-version/dist/index.js

# Systemd
systemctl stop 402pay
cd /opt/402pay-previous
systemctl start 402pay
```

### 2. Database Rollback

```bash
# Prisma migrations support rollback
cd packages/facilitator

# Check migration history
pnpm prisma migrate status

# Rollback last migration
pnpm prisma migrate resolve --rolled-back 20250119_migration_name

# Restore from backup if needed
gunzip < backup-20250119.sql.gz | psql $DATABASE_URL
```

---

## Troubleshooting

### Common Issues

#### 1. "CORS request blocked"

**Cause:** Origin not in ALLOWED_ORIGINS
**Fix:** Add origin to environment variable

```bash
# Update ALLOWED_ORIGINS
export ALLOWED_ORIGINS="$ALLOWED_ORIGINS,https://new-domain.com"

# Restart service
systemctl restart 402pay
```

#### 2. "Invalid API key"

**Cause:** Using demo-key in production or key not in database
**Fix:** Create proper API key via API

```bash
curl -X POST https://api.example.com/api-keys \
  -H "Content-Type: application/json" \
  -d '{"name":"Client Key","userId":"client-id","environment":"live"}'
```

#### 3. "Database connection pool exhausted"

**Cause:** Too many concurrent connections
**Fix:** Tune Prisma connection pool

```javascript
// In Prisma client initialization
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error'],
  // Connection pooling
  connection_limit: 20,
  pool_timeout: 30,
});
```

#### 4. "Payment verification failed"

**Cause:** SPL token validation or nonce replay
**Fix:** Check transaction details and nonce

```bash
# Check transaction on Solana Explorer
# https://explorer.solana.com/tx/SIGNATURE?cluster=mainnet

# Check nonce in database
pnpm prisma db execute --stdin <<< "SELECT * FROM nonces WHERE nonce='YOUR_NONCE'"

# Clear expired nonces
pnpm prisma db execute --stdin <<< "DELETE FROM nonces WHERE expires_at < NOW()"
```

---

## Production Checklist (Final)

Before going live:

- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Performance indexes created
- [ ] Environment variables configured (via secrets manager)
- [ ] CORS origins whitelisted (no wildcards)
- [ ] API keys generated (demo-key disabled)
- [ ] Health checks responding
- [ ] Metrics endpoint working
- [ ] Logs flowing to aggregation service
- [ ] Backups configured and tested
- [ ] Monitoring and alerts configured
- [ ] Rollback procedure documented and tested
- [ ] Load testing completed
- [ ] Security scan passed
- [ ] SSL certificate valid
- [ ] DNS configured
- [ ] Firewall rules in place

---

## Support

For issues or questions:
- Review SECURITY_FIXES.md
- Check logs: /var/log/402pay/
- Monitor metrics: /metrics endpoint
- Database queries: Use Prisma Studio (`pnpm prisma studio`)
- GitHub Issues: https://github.com/your-org/402pay/issues

---

**Document Version:** 1.0
**Last Updated:** 2025-11-19
**Next Review:** Before next production deployment
