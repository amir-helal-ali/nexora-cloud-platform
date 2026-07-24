#!/bin/sh
# ============================================================================
# Nexora Cloud — Realtime-only entrypoint (for separate container)
# ============================================================================
# Use this when running the realtime service as its own container.
# Usage: docker run nexora/realtime /realtime.sh
# ============================================================================

set -e

echo "┌──────────────────────────────────────────────────────────────────────────┐"
echo "│              Nexora Realtime Service — Starting                           │"
echo "└──────────────────────────────────────────────────────────────────────────┘"

PORT=${REALTIME_PORT:-3003}
echo "⚡ Starting WebSocket service on :$PORT"

cd /app/mini-services/realtime-service

# Set port via env if supported
export PORT=$PORT

# Run with auto-restart on crash
while true; do
  echo "[$(date)] Starting realtime service..."
  node index.ts
  EXIT_CODE=$?
  if [ $EXIT_CODE -eq 0 ]; then
    break
  fi
  echo "[$(date)] Service exited with code $EXIT_CODE. Restarting in 3s..."
  sleep 3
done
