# 🌥️ Nexora Cloud Platform

> Unified hosting platform for **Rust**, **PHP**, **Next.js**, **WebSocket** services, **Push Notifications**, and everything a professional web application needs.

[![CI](https://github.com/nexora-cloud/platform/actions/workflows/ci.yml/badge.svg)](https://github.com/nexora-cloud/platform/actions/workflows/ci.yml)
[![Docker](https://github.com/nexora-cloud/platform/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/nexora-cloud/platform/pkgs/container/nexora-cloud)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment)
- [Manual Setup](#manual-setup)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [CI/CD Pipeline](#cicd-pipeline)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Nexora Cloud is a production-ready, multi-tenant hosting platform that brings together everything you need to deploy, monitor, and scale modern web applications. Built with a Rust/PHP/Next.js multi-runtime philosophy, it provides a unified control plane for:

- **Applications** deployed as Docker containers (Rust, PHP, Next.js, Node.js, Static)
- **Managed databases** (PostgreSQL, MySQL, MongoDB, Redis, SQLite, MariaDB)
- **WebSocket services** for real-time communication
- **Push notifications** across web, email, SMS, and webhooks
- **CDN & edge cache** with 12 global PoPs
- **CI/CD pipelines** with Git integration
- **Service mesh** with mTLS, tracing, and traffic policies
- **Monitoring & alerting** with custom rules
- **Audit log** for SOC 2 / GDPR / HIPAA compliance

---

## ✨ Features

### 23 Integrated Modules

| Group | Module | Description |
|-------|--------|-------------|
| **Platform** | Overview | Live fleet dashboard with real-time metrics |
| | Applications | Multi-runtime deployment management (Rust/PHP/Next.js/Node/Static) |
| | CI/CD Pipelines | Build & deploy with stage visualization |
| | Analytics | Traffic, performance, geography & device insights |
| | Scaling Simulator | Test auto-scaling rules with traffic scenarios |
| | API Gateway | Routes, rate limiting, auth, middleware |
| | Feature Flags | Boolean, percentage, and A/B variant testing |
| | Service Mesh | Network topology, mTLS, distributed tracing |
| **Resources** | Databases | 6 managed engines (Postgres, MySQL, MongoDB, Redis, SQLite, MariaDB) |
| | WebSocket Services | Realtime endpoints with connection monitoring |
| | Push Notifications | 4 channels (Web Push, Email, In-App, Webhook) |
| | Backups | Automatic & manual snapshots with restore |
| | Secrets Manager | AES-256-GCM encrypted env vars |
| | CDN & Edge | 12 global PoPs with Anycast routing |
| **Observability** | Monitoring & Alerts | Custom metric thresholds and alert rules |
| | Deployments | CI/CD history with rollback |
| | Logs | Live streaming logs with filters |
| **Security** | Audit Log | Immutable event log with SIEM integration |
| **Integrations** | Marketplace | 28+ one-click integrations |
| **Admin** | Billing | Plans, usage, invoices, payment methods |
| | Domains & SSL | DNS management & auto-renewal |
| | Team | Members, roles, RBAC |
| | Settings | Account, security, API keys |

### Key Capabilities

- ⚡ **Real-time WebSocket streaming** — metrics update every 2 seconds
- 🔔 **Live push notifications** — instant toast delivery across devices
- 🚀 **Live deployment pipeline** — watch stages progress in real-time
- 🌗 **Dark / light mode** with system preference detection
- 📱 **Fully responsive** — mobile, tablet, desktop
- ⌨️ **Command Palette** (⌘K / Ctrl+K) for instant navigation
- 🔐 **Enterprise-grade security** — SOC 2, ISO 27001, GDPR, HIPAA, PCI DSS L1

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Browser / Mobile Client                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Caddy Reverse Proxy (HTTPS)                    │
│         Automatic SSL · HTTP/3 · WebSocket proxy · WAF           │
└──────────────┬───────────────────────────────┬──────────────────┘
               │                                │
               ▼                                ▼
┌──────────────────────┐         ┌──────────────────────────────┐
│   Next.js Dashboard   │         │   Realtime WebSocket Service  │
│   (port 3000)         │◄────────┤   Socket.io (port 3003)       │
│                       │  REST   │   Live metrics & push         │
│  • 23 modules         │         │                               │
│  • Prisma ORM         │         └──────────────────────────────┘
│  • SQLite / Postgres  │
└──────────┬────────────┘
           │
           ▼
┌──────────────────────┐
│   SQLite Database     │
│   /app/data/nexora.db│
│   (persistent volume)│
└──────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| **Backend** | Next.js API Routes (Node.js runtime) |
| **Authentication** | NextAuth.js v4 (credentials provider, bcrypt, JWT sessions) |
| **Realtime** | Socket.io 4 (mini-service on port 3003) |
| **Database** | Prisma ORM + SQLite (default) / PostgreSQL (production) |
| **Security** | Zod validation, rate limiting, AES-256-GCM encryption, audit logging |
| **Reverse Proxy** | Caddy 2 (auto HTTPS, HTTP/3) |
| **Containerization** | Docker (multi-stage builds, Alpine Linux) |
| **CI/CD** | GitHub Actions (lint, test, build, security, docker) |
| **Testing** | Vitest (59 unit tests) |
| **i18n** | Custom (Arabic + English, RTL/LTR) |
| **State** | Zustand (client), TanStack Query (server) |

---

## 🚀 Quick Start

### Option 1: Docker Compose (recommended)

```bash
# Clone the repository
git clone https://github.com/amir-helal-ali/nexora-cloud-platform.git
cd nexora-cloud-platform

# Copy environment file
cp .env.example .env

# IMPORTANT: Generate secure secrets for production
# Generate NEXTAUTH_SECRET:
openssl rand -base64 32
# Generate ENCRYPTION_KEY:
openssl rand -hex 32

# Edit .env with your generated secrets
nano .env

# Start all services (dashboard + realtime)
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f nexora
```

Open **http://localhost:3000** in your browser. You'll be redirected to `/login`.

**Default login credentials** (from seed data):
- **Email**: `owner@nexora.app`
- **Password**: `admin123`

> ⚠️ Change the default password immediately after first login in production!

The platform will:
1. Push the Prisma schema to SQLite
2. Seed the database with sample data (including the owner account)
3. Start the realtime WebSocket service on port 3003
4. Start the Next.js dashboard on port 3000
5. Health check available at `http://localhost:3000/api/health`

### Option 2: With Caddy reverse proxy (production)

```bash
# Enable the Caddy profile
docker compose --profile prod up -d

# Now accessible at https://your-domain.com
```

---

## 🐳 Docker Deployment

### Building Images Locally

```bash
# Build the dashboard image
docker build -t nexora-cloud/dashboard:latest .

# Build the realtime service image
docker build -t nexora-cloud/realtime:latest \
  -f Dockerfile.realtime .

# Build for multiple architectures (ARM64 + AMD64)
docker buildx build --platform linux/amd64,linux/arm64 \
  -t nexora-cloud/dashboard:latest \
  --push .
```

### Running Standalone Containers

```bash
# Create a persistent volume
docker volume create nexora-data

# Run the dashboard
docker run -d \
  --name nexora-dashboard \
  -p 3000:3000 \
  -v nexora-data:/app/data \
  -e DATABASE_URL=file:/app/data/nexora.db \
  -e REALTIME_URL=http://nexora-realtime:3003 \
  --network nexora-network \
  nexora-cloud/dashboard:latest

# Run the realtime service
docker run -d \
  --name nexora-realtime \
  -p 3003:3003 \
  --network nexora-network \
  nexora-cloud/realtime:latest
```

### Production Checklist

- [ ] Set `NEXTAUTH_SECRET` to a random 32-char string
- [ ] Set `NEXTAUTH_URL` to your public domain
- [ ] Configure `DASHBOARD_DOMAIN` and `REALTIME_DOMAIN` in Caddy
- [ ] Mount persistent volume for `/app/data`
- [ ] Set up database backups (see Backups module)
- [ ] Configure monitoring alerts (see Monitoring module)
- [ ] Review audit log retention policy
- [ ] Set resource limits in `docker-compose.yml`
- [ ] Enable Caddy `--profile prod` for HTTPS

### Health Checks

Both containers include health checks:

```bash
# Check dashboard health
curl http://localhost:3000/api/stats

# Check realtime health
curl http://localhost:3003/
```

### Resource Limits

The `docker-compose.yml` defines sensible defaults:

| Service | CPU Limit | Memory Limit | CPU Reserved | Memory Reserved |
|---------|-----------|--------------|--------------|-----------------|
| Dashboard | 2.0 | 1 GB | 0.5 | 256 MB |
| Realtime | 1.0 | 512 MB | 0.25 | 128 MB |

Adjust these in `deploy.resources` based on your workload.

---

## 💻 Manual Setup

### Prerequisites

- **Node.js** 18+ (or **Bun** 1.0+)
- **npm**, **yarn**, or **bun** package manager
- **Git**

### Installation

```bash
# Clone
git clone https://github.com/nexora-cloud/platform.git
cd platform

# Install dependencies (using bun — fastest)
bun install

# Or with npm
npm install

# Copy env
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push schema to SQLite
npx prisma db push

# Seed the database
bun run scripts/seed.ts

# Start the realtime service (in a separate terminal)
cd mini-services/realtime-service
bun install
bun run dev

# Start the Next.js dev server (in the main terminal)
cd ../..
bun run dev
```

Open **http://localhost:3000**.

### Production Build

```bash
# Build
bun run build

# Start production server
bun run start
```

---

## ⚙️ Configuration

### Environment Variables

See [`.env.example`](.env.example) for the complete list. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:/app/data/nexora.db` | SQLite path or Postgres/MySQL URL |
| `REALTIME_PORT` | `3003` | WebSocket service port |
| `REALTIME_URL` | `http://realtime:3003` | URL for dashboard to connect |
| `NEXTAUTH_SECRET` | `change-me` | Auth secret (32+ random chars) |
| `NEXTAUTH_URL` | `http://localhost:3000` | Public URL |
| `DASHBOARD_DOMAIN` | `localhost` | Caddy domain |
| `REALTIME_DOMAIN` | `localhost` | Realtime subdomain |

### Database Switch

To switch from SQLite to PostgreSQL:

1. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://user:pass@db:5432/nexora?schema=public
   ```
2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Rebuild: `docker compose up -d --build`

---

## 📡 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Aggregate dashboard statistics |
| `/api/apps` | GET, POST | List / create applications |
| `/api/apps/[id]` | PATCH, DELETE | Update / delete an app |
| `/api/apps/[id]/deploy` | POST | Trigger a deployment |
| `/api/databases` | GET, POST | List / create databases |
| `/api/databases/[id]` | PATCH, DELETE | Update / delete a database |
| `/api/domains` | GET, POST | List / add domains |
| `/api/domains/[id]` | DELETE | Remove a domain |
| `/api/team` | GET, POST | List / invite team members |
| `/api/team/[id]` | PATCH, DELETE | Update / remove a member |
| `/api/notifications` | GET, POST | List / send notifications |
| `/api/notifications/[id]` | PATCH, DELETE | Update / delete |
| `/api/websocket-services` | GET | List WebSocket endpoints |
| `/api/deployments` | GET | Deployment history |
| `/api/logs` | GET | App logs (filterable) |
| `/api/activities` | GET | Activity feed |
| `/api/push-test` | POST | Send a test push notification |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `metrics` | Server → Client | Live fleet metrics (every 2s) |
| `snapshot` | Server → Client | Initial state on connect |
| `push-notification` | Server → Client | Live push notification |
| `app-status` | Server → Client | App deploy/restart status |
| `subscribe-app` | Client → Server | Subscribe to specific app |
| `deploy-app` | Client → Server | Trigger deployment |
| `restart-app` | Client → Server | Restart an app |
| `toggle-app` | Client → Server | Start/stop an app |
| `send-push-test` | Client → Server | Send a test push |

---

## 🔄 CI/CD Pipeline

This repo includes GitHub Actions workflows:

### 1. CI Pipeline (`.github/workflows/ci.yml`)

Runs on every push and PR:
- ✅ Lint (ESLint)
- ✅ Type check (TypeScript)
- ✅ Unit tests (when added)
- ✅ Build verification

### 2. Docker Publish (`.github/workflows/docker-publish.yml`)

Triggers on release / main branch:
- 🐳 Build multi-arch images (amd64 + arm64)
- 📦 Push to GitHub Container Registry
- 🏷️ Tag with version + latest

### Using Pre-built Images

```bash
# Pull from GitHub Container Registry
docker pull ghcr.io/nexora-cloud/dashboard:latest
docker pull ghcr.io/nexora-cloud/realtime:latest

# Or run via compose
docker compose -f docker-compose.ghcr.yml up -d
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. **Fork** the repository
2. Create a **feature branch**: `git checkout -b feat/amazing-feature`
3. **Commit** changes following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: add new monitoring metric
   fix: resolve websocket reconnection issue
   docs: update API reference
   ```
4. **Push** to your fork
5. Open a **Pull Request**

### Code Quality

- All code must pass `bun run lint` with zero errors
- TypeScript strict mode is enabled
- Follow the existing code style (enforced by ESLint + Prettier)
- Add tests for new features (when applicable)

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 🆘 Support

- 📖 **Documentation**: [docs.nexora.app](https://docs.nexora.app)
- 💬 **Discord**: [discord.gg/nexora](https://discord.gg/nexora)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/nexora-cloud/platform/issues)
- 📧 **Email**: support@nexora.app

---

## 🙏 Acknowledgments

Built with these amazing open-source projects:

- [Next.js](https://nextjs.org/) — React framework
- [Prisma](https://www.prisma.io/) — Type-safe ORM
- [Socket.io](https://socket.io/) — Real-time communication
- [shadcn/ui](https://ui.shadcn.com/) — UI components
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Caddy](https://caddyserver.com/) — Reverse proxy
- [Lucide](https://lucide.dev/) — Icon library
- [Framer Motion](https://www.framer.com/motion/) — Animations

---

<p align="center">
  Made with ❤️ by the Nexora Cloud team
</p>
