# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added — Production Hardening
- NextAuth.js authentication with bcrypt password hashing (12 rounds)
- Login page (`/login`) and Register page (`/register`)
- middleware.ts protecting all routes with security headers
- Zod validation schemas on ALL API routes (12 schemas)
- Rate limiting: 100 req/min per user (in-memory sliding window)
- AES-256-GCM encryption for secrets (via Node crypto)
- Audit logging on every database mutation (13 fields per event)
- Error boundaries: error.tsx, not-found.tsx, loading.tsx
- Health check endpoint at `/api/health` (checks DB + realtime)
- 7 security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
- CORS restriction on realtime service (ALLOWED_ORIGINS env var)
- 98 unit tests (security, auth, validation, database, i18n)
- PostgreSQL migration guide (`docs/POSTGRESQL_MIGRATION.md`)
- CI pipeline with dedicated test job + coverage artifacts

### Added — Backend Integration (100%)
- 8 new API routes: monitoring, pipelines, marketplace, billing, analytics, settings, cdn, mesh
- ALL 23 views now fetch from real API endpoints backed by database
- ALL mutations (create/update/delete) persist to database
- API key generation with SHA-256 hashing
- Real billing usage from database (apps, storage, connections counts)
- Real analytics from database (runtime breakdown, channel stats)
- Real mesh topology from apps + databases + gateway routes
- Real pipelines from deployment history

### Added — Docker & Infrastructure
- Docker multi-stage builds for production (Dockerfile + Dockerfile.realtime)
- Docker Compose orchestration (production + dev + GHCR variants)
- Caddy reverse proxy with auto-HTTPS and HTTP/3
- GitHub Actions CI pipeline (lint, test, build, security, docker build)
- GitHub Actions Docker publish workflow (multi-arch: amd64 + arm64)
- Dependabot configuration for npm, GitHub Actions, and Docker
- Issue templates (bug report, feature request)
- Pull request template
- Comprehensive README with deployment guide
- Contributing guidelines
- MIT License
- `.env.example` with all configuration options (NEXTAUTH_SECRET, ENCRYPTION_KEY, ALLOWED_ORIGINS)

### Added — i18n (Arabic + English)
- Complete Arabic translations (912 keys) with RTL layout
- English translations for parity
- LanguageToggle component in Topbar
- DirectionProvider syncing `<html dir/lang>` with locale
- Cairo font for Arabic rendering
- Logical CSS properties (me-*, ms-*, pe-*) for RTL/LTR

### Changed
- Prisma schema: added 6 new models (Secret, FeatureFlag, AuditLog, Backup, ApiKey, GatewayRoute)
- User model: added password field (bcrypt hash)
- Seed script: creates owner with password `admin123`, encrypts secrets
- Dockerfile: added NEXTAUTH_SECRET, ENCRYPTION_KEY, ALLOWED_ORIGINS env vars
- docker-compose.yml: healthcheck uses `/api/health`

### Changed
- Updated `.gitignore` for Docker workflow
- Caddyfile upgraded with security headers and CSP

## [1.0.0] — 2026-07-24

### Added — 23 Modules

#### Platform
- **Overview**: Real-time fleet monitoring with live WebSocket metrics
- **Applications**: Multi-runtime deployment (Rust, PHP, Next.js, Node.js, Static)
- **CI/CD Pipelines**: Stage visualization with live progress simulation
- **Analytics**: Traffic, performance, geography, and device insights
- **Scaling Simulator**: Auto-scaling test scenarios (Black Friday, DDoS, etc.)
- **API Gateway**: Routes, rate limiting, auth, and middleware
- **Feature Flags**: Boolean, percentage, and A/B variant rollout
- **Service Mesh**: Network topology, mTLS, and distributed tracing

#### Resources
- **Databases**: 6 managed engines (PostgreSQL, MySQL, MongoDB, Redis, SQLite, MariaDB)
- **WebSocket Services**: Realtime endpoints with connection monitoring
- **Push Notifications**: 4 channels (Web Push, Email, In-App, Webhook)
- **Backups**: Automatic, manual, and snapshot types with restore
- **Secrets Manager**: AES-256-GCM encrypted environment variables
- **CDN & Edge**: 12 global PoPs with Anycast routing

#### Observability
- **Monitoring & Alerts**: Custom metric thresholds with 3 severity levels
- **Deployments**: CI/CD history with stage timeline and rollback
- **Logs**: Live streaming with level filters and export

#### Security
- **Audit Log**: 20+ event types with SIEM streaming (Splunk, Datadog, etc.)

#### Integrations
- **Marketplace**: 28 one-click integrations (Stripe, OpenAI, Sentry, Slack, etc.)

#### Administration
- **Billing**: 4 plans, 12 invoices, payment methods, usage quotas
- **Domains & SSL**: DNS management with Let's Encrypt auto-renewal
- **Team**: RBAC with 4 roles (Owner, Admin, Developer, Viewer)
- **Settings**: Account, billing, security, API keys

### Infrastructure
- Next.js 16 with App Router + Turbopack
- Prisma ORM with SQLite (default) / PostgreSQL (production)
- Socket.io 4 WebSocket service (mini-service on port 3003)
- Zustand for client state management
- Tailwind CSS 4 + shadcn/ui component library
- Framer Motion animations
- Light/dark mode with `next-themes`
- Command Palette (Cmd+K) with 35+ commands
- Responsive design (mobile, tablet, desktop)
