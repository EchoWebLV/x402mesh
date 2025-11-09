# Deployment Guide

Complete guide for deploying x402mesh to production.

---

## Table of Contents

1. [Local Development](#local-development)
2. [Production Deployment](#production-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Solana Configuration](#solana-configuration)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL 14+ (optional)
- Solana CLI (optional, for wallet management)

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/agent-2-agent-infra.git
cd agent-2-agent-infra

# Install dependencies
npm install

# Build packages
npm run build

# Start all services
./scripts/start-all.sh
```

### Individual Services

```bash
# Terminal 1: Registry
cd packages/registry
npm run build
node dist/index.js

# Terminal 2: Router
cd packages/router
npm run build
node dist/index.js

# Terminal 3: Demo Agents
npx tsx demo/agents/translator-agent.ts
npx tsx demo/agents/summarizer-agent.ts
npx tsx demo/agents/analyzer-agent.ts

# Terminal 4: Web UI
cd web
npm run dev
```

### Environment Setup

Create `.env` in project root:

```bash
# Database (optional - falls back to in-memory)
DATABASE_URL=postgresql://user:password@localhost:5432/x402mesh

# Services
REGISTRY_PORT=3001
ROUTER_PORT=3002
REGISTRY_URL=http://localhost:3001
ROUTER_URL=http://localhost:3002

# Solana
REAL_TRANSACTIONS=false
SOLANA_RPC_URL=https://api.devnet.solana.com

# Optional: OpenAI for real AI capabilities
OPENAI_API_KEY=sk-...

# Agent Wallets (auto-generated if not set)
TRANSLATOR_WALLET=TranslatorWallet
SUMMARIZER_WALLET=SummarizerWallet
ANALYZER_WALLET=AnalyzerWallet
```

---

## Production Deployment

### Option 1: Docker Deployment

#### Build Images

```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: x402mesh
      POSTGRES_USER: x402mesh
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  registry:
    build:
      context: .
      dockerfile: packages/registry/Dockerfile
    environment:
      DATABASE_URL: postgresql://x402mesh:${DB_PASSWORD}@postgres:5432/x402mesh
      REGISTRY_PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  router:
    build:
      context: .
      dockerfile: packages/router/Dockerfile
    environment:
      REGISTRY_URL: http://registry:3001
      ROUTER_PORT: 3002
      SOLANA_RPC_URL: ${SOLANA_RPC_URL}
      REAL_TRANSACTIONS: ${REAL_TRANSACTIONS}
    ports:
      - "3002:3002"
    depends_on:
      - registry

  web:
    build:
      context: .
      dockerfile: web/Dockerfile
    environment:
      NEXT_PUBLIC_REGISTRY_URL: http://registry:3001
      NEXT_PUBLIC_ROUTER_URL: http://router:3002
    ports:
      - "3000:3000"
    depends_on:
      - router

volumes:
  postgres_data:
```

### Option 2: Cloud Deployment (AWS/GCP/Azure)

#### AWS Example

```bash
# Install AWS CLI
aws configure

# Create ECR repositories
aws ecr create-repository --repository-name x402mesh-registry
aws ecr create-repository --repository-name x402mesh-router
aws ecr create-repository --repository-name x402mesh-web

# Build and push images
docker build -t x402mesh-registry -f packages/registry/Dockerfile .
docker tag x402mesh-registry:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/x402mesh-registry:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/x402mesh-registry:latest

# Deploy to ECS/EKS
# Use terraform or CloudFormation templates
```

### Option 3: VPS Deployment (DigitalOcean, Linode, etc.)

```bash
# SSH into server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Clone and setup
git clone https://github.com/yourusername/agent-2-agent-infra.git
cd agent-2-agent-infra
npm install
npm run build

# Setup systemd services (see below)
```

#### Systemd Service Files

**/etc/systemd/system/x402mesh-registry.service**:
```ini
[Unit]
Description=x402mesh Registry
After=network.target postgresql.service

[Service]
Type=simple
User=x402mesh
WorkingDirectory=/opt/x402mesh
ExecStart=/usr/bin/node packages/registry/dist/index.js
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/opt/x402mesh/.env

[Install]
WantedBy=multi-user.target
```

**/etc/systemd/system/x402mesh-router.service**:
```ini
[Unit]
Description=x402mesh Router
After=network.target x402mesh-registry.service

[Service]
Type=simple
User=x402mesh
WorkingDirectory=/opt/x402mesh
ExecStart=/usr/bin/node packages/router/dist/index.js
Restart=always
Environment=NODE_ENV=production
EnvironmentFile=/opt/x402mesh/.env

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start services
sudo systemctl enable x402mesh-registry
sudo systemctl enable x402mesh-router
sudo systemctl start x402mesh-registry
sudo systemctl start x402mesh-router

# Check status
sudo systemctl status x402mesh-registry
sudo systemctl status x402mesh-router
```

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REGISTRY_PORT` | Registry service port | `3001` |
| `ROUTER_PORT` | Router service port | `3002` |
| `SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.mainnet-beta.solana.com` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `REAL_TRANSACTIONS` | Enable real Solana transactions | `false` |
| `OPENAI_API_KEY` | OpenAI API key for AI agents | - |
| `REGISTRY_URL` | Registry service URL | `http://localhost:3001` |
| `ROUTER_URL` | Router service URL | `http://localhost:3002` |
| `NODE_ENV` | Environment mode | `development` |

### Agent-Specific

| Variable | Description | Default |
|----------|-------------|---------|
| `TRANSLATOR_WALLET` | Translator wallet name | `TranslatorWallet` |
| `SUMMARIZER_WALLET` | Summarizer wallet name | `SummarizerWallet` |
| `ANALYZER_WALLET` | Analyzer wallet name | `AnalyzerWallet` |

---

## Database Setup

### PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Docker
```bash
docker run -d \
  --name x402mesh-postgres \
  -e POSTGRES_DB=x402mesh \
  -e POSTGRES_USER=x402mesh \
  -e POSTGRES_PASSWORD=secretpassword \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:14
```

### Database Initialization

```bash
# Create database
createdb x402mesh

# Initialize schema
psql x402mesh < packages/registry/init-db.sql

# Verify
psql x402mesh -c "\dt"
```

### Database Migrations

```sql
-- init-db.sql
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  endpoint TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  capabilities JSONB NOT NULL,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);
```

---

## Solana Configuration

### Devnet (Testing)

```bash
# .env
SOLANA_RPC_URL=https://api.devnet.solana.com
REAL_TRANSACTIONS=true

# USDC devnet mint (create your own or use existing)
# See: https://spl.solana.com/token
```

### Mainnet (Production)

```bash
# .env
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
REAL_TRANSACTIONS=true

# Mainnet USDC mint
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Wallet Setup

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Generate wallets for agents
solana-keygen new --outfile ~/.config/solana/translator-wallet.json
solana-keygen new --outfile ~/.config/solana/summarizer-wallet.json
solana-keygen new --outfile ~/.config/solana/analyzer-wallet.json

# Fund wallets (devnet)
solana airdrop 2 $(solana-keygen pubkey ~/.config/solana/translator-wallet.json) --url devnet

# Fund wallets (mainnet)
# Transfer SOL manually to wallet addresses
```

### RPC Providers

#### Free Options
- Solana Public RPC: `https://api.mainnet-beta.solana.com` (rate-limited)
- Devnet: `https://api.devnet.solana.com`

#### Paid Options (Recommended for Production)
- **Helius**: https://helius.xyz - 100k req/day free
- **QuickNode**: https://quicknode.com - Fast, reliable
- **Alchemy**: https://alchemy.com - Enterprise-grade
- **Triton**: https://triton.one - High performance

```bash
# Example with Helius
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

---

## Monitoring

### Health Checks

```bash
# Registry health
curl http://localhost:3001/health

# Router health
curl http://localhost:3002/health

# Agent health
curl http://localhost:3100/health  # Translator
curl http://localhost:3101/health  # Summarizer
curl http://localhost:3102/health  # Analyzer
```

### Logging

#### Application Logs

```bash
# View registry logs
journalctl -u x402mesh-registry -f

# View router logs
journalctl -u x402mesh-router -f

# Docker logs
docker-compose logs -f registry
docker-compose logs -f router
```

#### Log Management

Use a log aggregation service:

```bash
# Example with Winston + CloudWatch
npm install winston winston-cloudwatch

# packages/registry/src/logger.ts
import winston from 'winston';
import CloudWatchTransport from 'winston-cloudwatch';

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new CloudWatchTransport({
      logGroupName: 'x402mesh-registry',
      logStreamName: 'production'
    })
  ]
});
```

### Metrics

#### Prometheus + Grafana

```typescript
// packages/router/src/metrics.ts
import promClient from 'prom-client';

const register = new promClient.Registry();

export const paymentCounter = new promClient.Counter({
  name: 'x402mesh_payments_total',
  help: 'Total number of payments processed',
  registers: [register]
});

export const chainDuration = new promClient.Histogram({
  name: 'x402mesh_chain_duration_seconds',
  help: 'Chain execution duration',
  registers: [register]
});

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## Security

### Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use secret management (AWS Secrets Manager, HashiCorp Vault)
   - Rotate credentials regularly

2. **HTTPS/TLS**
   ```nginx
   # nginx config
   server {
     listen 443 ssl;
     server_name api.x402mesh.com;
     
     ssl_certificate /etc/letsencrypt/live/x402mesh.com/fullchain.pem;
     ssl_certificate_key /etc/letsencrypt/live/x402mesh.com/privkey.pem;
     
     location / {
       proxy_pass http://localhost:3001;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```

3. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

4. **Input Validation**
   ```typescript
   import { z } from 'zod';
   
   const agentSchema = z.object({
     name: z.string().min(1).max(100),
     walletAddress: z.string().length(44),
     capabilities: z.array(z.object({
       name: z.string(),
       pricing: z.object({
         amount: z.number().positive(),
         currency: z.enum(['USDC', 'SOL'])
       })
     }))
   });
```

---

## Backup & Recovery

### Database Backups

```bash
# Automated daily backups
0 2 * * * pg_dump x402mesh | gzip > /backups/x402mesh-$(date +\%Y\%m\%d).sql.gz

# Restore from backup
gunzip < backup.sql.gz | psql x402mesh
```

### Wallet Backups

```bash
# Backup wallet keypairs securely
tar -czf wallets-backup.tar.gz ~/.config/solana/*.json

# Encrypt backup
gpg -c wallets-backup.tar.gz

# Store encrypted backup in secure location
# (AWS S3 with encryption, encrypted USB drive, etc.)
```

---

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml with replicas
services:
  router:
    deploy:
      replicas: 3
    environment:
      REGISTRY_URL: http://registry:3001

  nginx:
    image: nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
    depends_on:
      - router
```

### Load Balancing

```nginx
# nginx.conf
upstream router_backend {
  server router1:3002;
  server router2:3002;
  server router3:3002;
}

server {
  listen 80;
  location / {
    proxy_pass http://router_backend;
  }
}
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### Database Connection Failed
```bash
# Check PostgreSQL is running
systemctl status postgresql

# Check connection
psql -h localhost -U x402mesh -d x402mesh

# Check firewall
sudo ufw allow 5432/tcp
```

#### Solana RPC Timeout
```bash
# Test RPC connection
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  https://api.devnet.solana.com

# Switch to different RPC provider
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

#### Out of Memory
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" node dist/index.js

# Monitor memory
htop
```

### Support

- **Documentation:** [GUIDE.md](./GUIDE.md)
- **Issues:** GitHub Issues
- **Logs:** Check application and system logs

---

## Production Checklist

Before going live:

- [ ] Environment variables configured
- [ ] PostgreSQL database set up and backed up
- [ ] Solana wallets funded and secured
- [ ] HTTPS/TLS certificates installed
- [ ] Rate limiting enabled
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated

---

## Performance Tuning

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_agents_updated_at ON agents(updated_at DESC);
CREATE INDEX idx_agents_endpoint ON agents(endpoint);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM agents WHERE tags @> ARRAY['translation'];
```

### Node.js Optimization

```javascript
// Use clustering for multi-core CPUs
import cluster from 'cluster';
import os from 'os';

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Worker process runs the server
  startServer();
}
```

---

Ready to deploy! 🚀

