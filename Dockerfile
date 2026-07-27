# ============================================================================
# Nexora Cloud Platform — Production Dockerfile (multi-stage)
# ============================================================================
# Stage 1: Install dependencies (cached layer)
# Stage 2: Build the Next.js app (standalone output)
# Stage 3: Install realtime service dependencies
# Stage 4: Production runtime (minimal, non-root, healthchecked)
# ============================================================================

# ---- Stage 1: deps ----
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Enable Bun via corepack
RUN corepack enable && corepack prepare yarn@4.5.0 --activate

# Copy lockfile + package.json first (cache layer)
COPY package.json bun.lock* yarn.lock* ./

# Install with cache mount for faster rebuilds
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache \
    if [ -f bun.lock ]; then \
      npm install -g bun && bun install --frozen-lockfile; \
    else \
      yarn install --immutable; \
    fi

# ---- Stage 2: builder ----
FROM node:24-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy installed deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment vars for build-time only (NOT baked into image)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL="file:/tmp/build.db"

# Generate Prisma client
RUN npx prisma generate

# Build Next.js (standalone output mode)
RUN npm run build

# ---- Stage 3: realtime-deps ----
FROM node:24-alpine AS realtime-deps
WORKDIR /app/mini-services/realtime-service
COPY mini-services/realtime-service/package.json mini-services/realtime-service/bun.lock* ./
RUN npm install -g bun && bun install --frozen-lockfile

# ---- Stage 4: runner (final image) ----
FROM node:24-alpine AS runner
LABEL org.opencontainers.image.title="Nexora Cloud Platform"
LABEL org.opencontainers.image.description="Multi-runtime hosting platform — Rust, PHP, Next.js, WebSocket, Push Notifications"
LABEL org.opencontainers.image.source="https://github.com/nexora-cloud/platform"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.authors="Nexora Cloud Team"

# Install runtime dependencies
RUN apk add --no-cache libc6-compat openssl tini curl

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Set secure environment defaults (override at runtime)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="file:/app/data/nexora.db"
ENV REALTIME_PORT=3003
ENV REALTIME_URL="http://localhost:3003"
# Auth — MUST be overridden in production
ENV NEXTAUTH_SECRET="change-me-in-production-32chars"
ENV NEXTAUTH_URL="http://localhost:3000"
# Encryption — MUST be overridden in production
ENV ENCRYPTION_KEY="0000000000000000000000000000000000000000000000000000000000000000"
# CORS for realtime service
ENV ALLOWED_ORIGINS="http://localhost:3000"

# ---- Copy built Next.js standalone ----
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# ---- Copy Prisma schema + migrations ----
COPY --chown=nextjs:nodejs prisma ./prisma
COPY --chown=nextjs:nodejs scripts/seed.ts ./scripts/seed.ts

# ---- Copy realtime service ----
COPY --chown=nextjs:nodejs mini-services/realtime-service ./mini-services/realtime-service
COPY --from=realtime-deps --chown=nextjs:nodejs /app/mini-services/realtime-service/node_modules ./mini-services/realtime-service/node_modules

# ---- Copy entrypoint script ----
COPY --chown=nextjs:nodejs docker/entrypoint.sh /entrypoint.sh
COPY --chown=nextjs:nodejs docker/realtime.sh /realtime.sh
RUN chmod +x /entrypoint.sh /realtime.sh

# Create data directory for SQLite (persistent volume mount point)
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Switch to non-root user
USER nextjs

# Expose Next.js + realtime ports
EXPOSE 3000 3003

# Health check for Next.js (every 30s, 3 retries)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini as PID 1 for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["/entrypoint.sh"]
