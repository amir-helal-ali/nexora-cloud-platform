#!/bin/sh
# ============================================================================
# Nexora Cloud — Main entrypoint (Next.js + sidecar realtime)
# ============================================================================
# Responsibilities:
#   1. Run Prisma migrations (db push) to ensure schema is up-to-date
#   2. Seed the database if it's empty (first run only)
#   3. Start the realtime WebSocket service in background
#   4. Start the Next.js production server in foreground
# ============================================================================

set -e

echo "┌──────────────────────────────────────────────────────────────────────────┐"
echo "│                    Nexora Cloud Platform — Starting                       │"
echo "└──────────────────────────────────────────────────────────────────────────┘"

# Ensure data directory exists
mkdir -p /app/data

# ---- 1. Prisma migrations ----
echo "📦 [1/4] Pushing Prisma schema to database..."
cd /app
npx prisma db push --accept-data-loss --skip-generate 2>&1 | sed 's/^/   /'
echo "   ✓ Schema pushed"

# ---- 2. Seed (if empty) ----
echo "🌱 [2/4] Checking database state..."
SEED_CHECK=$(node -e "
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
db.user.count().then(c => { console.log(c); process.exit(0); }).catch(e => { console.log(0); process.exit(0); });
" 2>/dev/null || echo "0")

if [ "$SEED_CHECK" = "0" ]; then
  echo "   Seeding initial data (first run)..."
  npx bun run scripts/seed.ts 2>&1 | grep -v "^prisma:query" | sed 's/^/   /' || echo "   ⚠ Seed script skipped (non-fatal)"
  echo "   ✓ Database seeded"
else
  echo "   ✓ Database already has $SEED_CHECK users, skipping seed"
fi

# ---- 3. Start realtime service ----
echo "⚡ [3/4] Starting realtime WebSocket service on :${REALTIME_PORT:-3003}..."
cd /app/mini-services/realtime-service
nohup node index.ts > /tmp/realtime.log 2>&1 &
REALTIME_PID=$!
echo "   ✓ Realtime PID: $REALTIME_PID"

# Wait briefly for realtime to be ready
for i in $(seq 1 10); do
  if curl -sf "http://localhost:${REALTIME_PORT:-3003}/" > /dev/null 2>&1; then
    echo "   ✓ Realtime service is responding"
    break
  fi
  sleep 1
done

# ---- 4. Start Next.js production server ----
echo "🚀 [4/4] Starting Next.js production server on :${PORT:-3000}..."
cd /app
echo "┌──────────────────────────────────────────────────────────────────────────┐"
echo "│  ✅ Nexora Cloud is live!                                                 │"
echo "│  Dashboard:   http://0.0.0.0:${PORT:-3000}                                 │"
echo "│  Realtime:    ws://0.0.0.0:${REALTIME_PORT:-3003}                          │"
echo "│  Database:    ${DATABASE_URL}                                              │"
echo "└──────────────────────────────────────────────────────────────────────────┘"

# Trap signals for graceful shutdown
trap 'kill $REALTIME_PID 2>/dev/null; exit 0' SIGTERM SIGINT

# Start Next.js in foreground (this becomes PID 1's main child)
exec node server.js
