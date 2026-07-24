'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export interface LiveApp {
  id: string
  name: string
  runtime: string
  status: string
  cpu: number
  memory: number
  rps: number
  uptime: number
}

export interface LiveDatabase {
  id: string
  name: string
  engine: string
  connections: number
  maxConnections: number
  usedMb: number
  size: number
}

export interface LiveHistory {
  cpu: number[]
  memory: number[]
  rps: number[]
  network: number[]
}

export interface LiveTotals {
  apps: number
  running: number
  totalRps: number
  totalConnections: number
  storageUsedMb: number
  storageTotalMb: number
}

export interface LiveMetrics {
  ts: number
  apps: LiveApp[]
  databases: LiveDatabase[]
  history: LiveHistory
  totals: LiveTotals
}

export interface PushNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  ts: number
}

export interface AppStatusEvent {
  appId: string
  status: string
  message: string
  commitSha?: string
}

// Singleton socket across hooks
let socket: Socket | null = null
let refCount = 0

function getSocket(): Socket {
  if (!socket) {
    socket = io('/?XTransformPort=3003', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    })
  }
  return socket
}

export function useRealtime() {
  const [connected, setConnected] = useState(false)
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null)
  const [pushNotifications, setPushNotifications] = useState<PushNotification[]>([])
  const [appStatusEvents, setAppStatusEvents] = useState<AppStatusEvent[]>([])
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const s = getSocket()
    socketRef.current = s
    refCount++

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    const onMetrics = (data: LiveMetrics) => setMetrics(data)
    const onSnapshot = (data: { apps: LiveApp[]; databases: LiveDatabase[]; history: LiveHistory }) => {
      setMetrics({
        ts: Date.now(),
        apps: data.apps,
        databases: data.databases,
        history: data.history,
        totals: {
          apps: data.apps.length,
          running: data.apps.filter(a => a.status === 'running').length,
          totalRps: data.apps.reduce((s, a) => s + a.rps, 0),
          totalConnections: data.databases.reduce((s, d) => s + d.connections, 0),
          storageUsedMb: data.databases.reduce((s, d) => s + d.usedMb, 0),
          storageTotalMb: data.databases.reduce((s, d) => s + d.size, 0),
        },
      })
    }
    const onPush = (data: PushNotification) => {
      setPushNotifications(prev => [data, ...prev].slice(0, 50))
    }
    const onAppStatus = (data: AppStatusEvent) => {
      setAppStatusEvents(prev => [data, ...prev].slice(0, 20))
    }

    s.on('connect', onConnect)
    s.on('disconnect', onDisconnect)
    s.on('metrics', onMetrics)
    s.on('snapshot', onSnapshot)
    s.on('push-notification', onPush)
    s.on('app-status', onAppStatus)

    return () => {
      s.off('connect', onConnect)
      s.off('disconnect', onDisconnect)
      s.off('metrics', onMetrics)
      s.off('snapshot', onSnapshot)
      s.off('push-notification', onPush)
      s.off('app-status', onAppStatus)
      refCount--
      if (refCount === 0 && socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [])

  const deployApp = useCallback((appId: string, commitSha?: string) => {
    socketRef.current?.emit('deploy-app', { appId, commitSha: commitSha || Math.random().toString(16).substr(2, 7) })
  }, [])

  const restartApp = useCallback((appId: string) => {
    socketRef.current?.emit('restart-app', { appId })
  }, [])

  const toggleApp = useCallback((appId: string) => {
    socketRef.current?.emit('toggle-app', { appId })
  }, [])

  const sendPushTest = useCallback((title: string, message: string) => {
    socketRef.current?.emit('send-push-test', { title, message })
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setPushNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAppStatus = useCallback(() => {
    setAppStatusEvents([])
  }, [])

  return {
    connected,
    metrics,
    pushNotifications,
    appStatusEvents,
    deployApp,
    restartApp,
    toggleApp,
    sendPushTest,
    dismissNotification,
    clearAppStatus,
  }
}
