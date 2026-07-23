#!/bin/bash
# Persistent watchdog for the realtime service
# Uses an infinite loop with sleep to restart on death
# Designed to survive parent process exits via setsid + disown

LOG=/tmp/realtime.log
WATCHDOG_LOG=/tmp/realtime-watchdog.log
SERVICE_DIR=/home/z/my-project/mini-services/realtime-service

echo "[$(date)] Watchdog started" >> $WATCHDOG_LOG

while true; do
  # Check if service is alive
  if ! pgrep -f "bun.*index.ts" > /dev/null 2>&1; then
    echo "[$(date)] Realtime service not running. Starting..." >> $WATCHDOG_LOG
    cd $SERVICE_DIR
    nohup bun index.ts > $LOG 2>&1 &
    echo "[$(date)] Started PID: $!" >> $WATCHDOG_LOG
    sleep 3
  else
    # Check if it's still responding
    if ! curl -s --max-time 2 http://localhost:3003/ > /dev/null 2>&1; then
      echo "[$(date)] Service not responding, killing and restarting..." >> $WATCHDOG_LOG
      pkill -f "bun.*index.ts" 2>/dev/null || true
      sleep 1
    fi
  fi
  sleep 10
done
