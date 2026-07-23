#!/bin/bash
# Auto-restart wrapper for the realtime service
cd /home/z/my-project/mini-services/realtime-service
while true; do
  echo "[$(date)] Starting realtime service..."
  bun index.ts > /tmp/realtime.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Realtime service exited with code $EXIT_CODE. Restarting in 2s..."
  sleep 2
done
