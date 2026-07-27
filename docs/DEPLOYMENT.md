# Nexora Cloud — Production Deployment Guide

This guide covers deploying Nexora Cloud to production with full security, monitoring, and scaling.

## Prerequisites

- Docker 24+ and Docker Compose v2+
- A domain name with DNS access
- SSL certificate (or use Caddy for auto-HTTPS)
- 2GB+ RAM server (4GB recommended)

## Step 1: Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose v2
sudo apt install docker-compose-plugin

# Verify
docker --version
docker compose version
```

## Step 2: Clone & Configure

```bash
git clone https://github.com/amir-helal-ali/nexora-cloud-platform.git
cd nexora-cloud-platform

# Copy environment file
cp .env.example .env

# Generate secure secrets
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"

# Edit .env with your values
nano .env
```

### Required Environment Variables

```bash
# Database
DATABASE_URL=file:/app/data/nexora.db
# For PostgreSQL: postgresql://user:pass@host:5432/nexora?schema=public

# Authentication
NEXTAUTH_SECRET=<your-generated-secret>
NEXTAUTH_URL=https://your-domain.com

# Encryption
ENCRYPTION_KEY=<your-generated-key>

# CORS
ALLOWED_ORIGINS=https://your-domain.com

# Domains (for Caddy)
DASHBOARD_DOMAIN=your-domain.com
REALTIME_DOMAIN=ws.your-domain.com

# Optional: Monitoring
SENTRY_DSN=https://xxx@sentry.io/1
```

## Step 3: Deploy with Docker Compose

### Option A: Single Server (recommended for small deployments)

```bash
# Build and start all services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f nexora

# Run database seed (first time only)
docker compose exec nexora bun run scripts/seed.ts
```

### Option B: With Caddy Reverse Proxy (auto-HTTPS)

```bash
# Set your domains in .env
echo "DASHBOARD_DOMAIN=your-domain.com" >> .env
echo "REALTIME_DOMAIN=ws.your-domain.com" >> .env

# Start with Caddy profile
docker compose --profile prod up -d --build
```

Caddy will automatically:
- Provision SSL certificates via Let's Encrypt
- Redirect HTTP → HTTPS
- Proxy WebSocket connections
- Apply security headers

### Option C: With PostgreSQL

```bash
# Uncomment the postgres service in docker-compose.yml
# Or use a managed PostgreSQL provider

# Update DATABASE_URL
echo 'DATABASE_URL=postgresql://nexora:password@postgres:5432/nexora?schema=public' >> .env

# Start
docker compose up -d --build
```

See `docs/POSTGRESQL_MIGRATION.md` for detailed PostgreSQL setup.

## Step 4: Verify Deployment

```bash
# Health check
curl https://your-domain.com/api/health
# Expected: {"status":"healthy","checks":{"database":{"status":"healthy"},...}}

# Login
# Visit https://your-domain.com/login
# Email: owner@nexora.app
# Password: admin123
```

## Step 5: Post-Deployment

### Change Default Password
1. Login with `owner@nexora.app` / `admin123`
2. Go to Settings → Account
3. Update your name and email
4. Save changes

### Configure Monitoring

#### Sentry (Error Tracking)
1. Create a project at https://sentry.io
2. Copy the DSN
3. Add to `.env`: `SENTRY_DSN=https://xxx@sentry.io/1`
4. Restart: `docker compose restart nexora`

#### Prometheus + Grafana (Metrics)
1. Deploy Prometheus:
```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus:latest
  container_name: nexora-prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./grafana/prometheus.yml:/etc/prometheus/prometheus.yml
  networks:
    - nexora-network
```

2. Deploy Grafana:
```yaml
grafana:
  image: grafana/grafana:latest
  container_name: nexora-grafana
  ports:
    - "3001:3000"
  volumes:
    - nexora-grafana:/var/lib/grafana
    - ./grafana/dashboard.json:/etc/grafana/provisioning/dashboards/nexora.json
  networks:
    - nexora-network
```

3. Import the dashboard from `grafana/dashboard.json`

### Set Up Backups

```bash
# Cron job for SQLite backup
echo "0 3 * * * docker compose exec nexora cp /app/data/nexora.db /backups/nexora-$(date +\%Y\%m\%d).db" | crontab -

# For PostgreSQL, see docs/POSTGRESQL_MIGRATION.md
```

## Step 6: Scaling

### Horizontal Scaling
```bash
# Scale the dashboard service
docker compose up -d --scale nexora=3

# Note: Requires PostgreSQL (SQLite doesn't support multi-instance)
```

### Load Balancer
```nginx
# nginx.conf
upstream nexora_dashboard {
    server dashboard-1:3000;
    server dashboard-2:3000;
    server dashboard-3:3000;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://nexora_dashboard;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/health {
        proxy_pass http://nexora_dashboard;
        access_log off;
    }
}
```

## Security Checklist

- [ ] Changed default password (admin123)
- [ ] Generated unique NEXTAUTH_SECRET
- [ ] Generated unique ENCRYPTION_KEY
- [ ] Set ALLOWED_ORIGINS to your domain
- [ ] Enabled HTTPS (via Caddy or nginx)
- [ ] Configured firewall (only expose 80, 443)
- [ ] Set up regular database backups
- [ ] Configured Sentry error monitoring
- [ ] Configured Prometheus metrics
- [ ] Reviewed audit logs for suspicious activity
- [ ] Disabled debug mode (NODE_ENV=production)
- [ ] Set up log rotation

## Troubleshooting

### Container won't start
```bash
docker compose logs nexora
# Check for DATABASE_URL, NEXTAUTH_SECRET, ENCRYPTION_KEY errors
```

### Database migration issues
```bash
docker compose exec nexora npx prisma db push --accept-data-loss
docker compose exec nexora bun run scripts/seed.ts
```

### WebSocket not connecting
```bash
# Check realtime service
docker compose logs realtime
# Verify ALLOWED_ORIGINS includes your domain
```

### Health check failing
```bash
curl http://localhost:3000/api/health
# Check database and realtime service status
```

## Support

- 📖 Documentation: [README.md](README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/amir-helal-ali/nexora-cloud-platform/issues)
- 📧 Email: support@nexora.app
