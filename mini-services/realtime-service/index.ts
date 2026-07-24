import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ============================================================================
// Nexora Cloud — Realtime Service
// Provides live monitoring data + push notifications for the hosting dashboard
// ============================================================================

interface AppRuntime {
  id: string
  name: string
  runtime: string
  status: string
  cpu: number
  memory: number
  rps: number
  uptime: number
}

// Mock fleet of running apps
const apps: AppRuntime[] = [
  { id: 'app_1', name: 'rust-api-gateway', runtime: 'rust', status: 'running', cpu: 12, memory: 28, rps: 1240, uptime: 99.98 },
  { id: 'app_2', name: 'php-laravel-store', runtime: 'php', status: 'running', cpu: 34, memory: 62, rps: 856, uptime: 99.92 },
  { id: 'app_3', name: 'nextjs-marketing', runtime: 'nextjs', status: 'running', cpu: 18, memory: 41, rps: 2104, uptime: 100 },
  { id: 'app_4', name: 'rust-ws-hub', runtime: 'rust', status: 'running', cpu: 8, memory: 19, rps: 342, uptime: 99.97 },
  { id: 'app_5', name: 'php-symfony-cms', runtime: 'php', status: 'building', cpu: 0, memory: 5, rps: 0, uptime: 0 },
  { id: 'app_6', name: 'nextjs-dashboard', runtime: 'nextjs', status: 'running', cpu: 27, memory: 53, rps: 712, uptime: 99.95 },
]

const databases = [
  { id: 'db_1', name: 'postgres-main', engine: 'postgresql', connections: 42, maxConnections: 100, usedMb: 612, size: 2048 },
  { id: 'db_2', name: 'mysql-store', engine: 'mysql', connections: 78, maxConnections: 200, usedMb: 1340, size: 4096 },
  { id: 'db_3', name: 'redis-cache', engine: 'redis', connections: 156, maxConnections: 10000, usedMb: 89, size: 256 },
  { id: 'db_4', name: 'mongo-events', engine: 'mongodb', connections: 23, maxConnections: 100, usedMb: 412, size: 1024 },
]

// History buffer for sparkline charts (last 60 ticks)
const cpuHistory: number[] = Array.from({ length: 60 }, () => 30 + Math.random() * 30)
const memHistory: number[] = Array.from({ length: 60 }, () => 40 + Math.random() * 30)
const rpsHistory: number[] = Array.from({ length: 60 }, () => 800 + Math.random() * 1200)
const netHistory: number[] = Array.from({ length: 60 }, () => 200 + Math.random() * 400)

// Push notifications queue
const pushTemplates = [
  { title: 'Deployment Successful', message: 'nextjs-marketing deployed to production in 38s', type: 'success' },
  { title: 'High CPU Alert', message: 'php-laravel-store CPU usage exceeded 80% for 5 minutes', type: 'warning' },
  { title: 'Auto-scaled', message: 'rust-api-gateway scaled from 2 → 4 instances', type: 'info' },
  { title: 'SSL Renewed', message: 'Certificate for api.nexora.app renewed automatically', type: 'success' },
  { title: 'Database Backup', message: 'postgres-main backup completed (612 MB)', type: 'info' },
  { title: 'Build Failed', message: 'php-symfony-cms build failed on stage "composer install"', type: 'error' },
  { title: 'WebSocket Reconnect', message: 'rust-ws-hub: 142 clients reconnected after deploy', type: 'info' },
  { title: 'DDoS Mitigated', message: 'Blocked 12.4k requests from suspicious IPs', type: 'warning' },
]

let pushIndex = 0

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))
const jitter = (base: number, range: number, min = 0, max = 100) =>
  clamp(base + (Math.random() - 0.5) * range, min, max)

function tick() {
  // Mutate app metrics with realistic small drifts
  for (const app of apps) {
    if (app.status === 'running') {
      app.cpu = jitter(app.cpu, 12, 1, 95)
      app.memory = jitter(app.memory, 6, 10, 90)
      app.rps = Math.max(50, app.rps + (Math.random() - 0.5) * 200)
    }
  }

  // Mutate database connections
  for (const db of databases) {
    db.connections = Math.max(0, db.connections + Math.round((Math.random() - 0.5) * 10))
    if (db.connections > db.maxConnections) db.connections = db.maxConnections
  }

  // Update history
  const avgCpu = apps.filter(a => a.status === 'running').reduce((s, a) => s + a.cpu, 0) / apps.length
  const avgMem = apps.filter(a => a.status === 'running').reduce((s, a) => s + a.memory, 0) / apps.length
  const totalRps = apps.reduce((s, a) => s + a.rps, 0)
  const totalNet = apps.reduce((s, a) => s + a.rps * 0.3, 0)

  cpuHistory.push(clamp(avgCpu, 0, 100)); cpuHistory.shift()
  memHistory.push(clamp(avgMem, 0, 100)); memHistory.shift()
  rpsHistory.push(totalRps); rpsHistory.shift()
  netHistory.push(totalNet); netHistory.shift()

  // Broadcast live metrics
  io.emit('metrics', {
    ts: Date.now(),
    apps,
    databases,
    history: {
      cpu: cpuHistory,
      memory: memHistory,
      rps: rpsHistory,
      network: netHistory,
    },
    totals: {
      apps: apps.length,
      running: apps.filter(a => a.status === 'running').length,
      totalRps: Math.round(totalRps),
      totalConnections: databases.reduce((s, d) => s + d.connections, 0),
      storageUsedMb: databases.reduce((s, d) => s + d.usedMb, 0),
      storageTotalMb: databases.reduce((s, d) => s + d.size, 0),
    },
  })
}

// Push notification broadcaster (every 8 seconds)
function pushTick() {
  const tpl = pushTemplates[pushIndex % pushTemplates.length]
  pushIndex++
  io.emit('push-notification', {
    id: `notif_${Date.now()}`,
    title: tpl.title,
    message: tpl.message,
    type: tpl.type,
    ts: Date.now(),
  })
}

io.on('connection', (socket) => {
  console.log(`[Nexora Realtime] Client connected: ${socket.id}`)

  // Send snapshot immediately on connect
  socket.emit('snapshot', {
    apps,
    databases,
    history: {
      cpu: cpuHistory,
      memory: memHistory,
      rps: rpsHistory,
      network: netHistory,
    },
  })

  // Subscribe to a specific app's live stream
  socket.on('subscribe-app', (appId: string) => {
    socket.join(`app:${appId}`)
    console.log(`[Nexora] ${socket.id} subscribed to app ${appId}`)
  })

  socket.on('unsubscribe-app', (appId: string) => {
    socket.leave(`app:${appId}`)
  })

  // Trigger a manual deploy event
  socket.on('deploy-app', (data: { appId: string; commitSha: string }) => {
    const app = apps.find(a => a.id === data.appId)
    if (!app) return
    app.status = 'building'
    io.emit('app-status', { appId: data.appId, status: 'building', message: 'Cloning repository...' })
    setTimeout(() => {
      io.emit('app-status', { appId: data.appId, status: 'building', message: 'Installing dependencies...' })
    }, 1500)
    setTimeout(() => {
      io.emit('app-status', { appId: data.appId, status: 'building', message: 'Compiling build artifacts...' })
    }, 3000)
    setTimeout(() => {
      io.emit('app-status', { appId: data.appId, status: 'deploying', message: 'Rolling out new instances...' })
    }, 4500)
    setTimeout(() => {
      app.status = 'running'
      io.emit('app-status', { appId: data.appId, status: 'running', message: 'Deployment live', commitSha: data.commitSha })
      io.emit('push-notification', {
        id: `notif_${Date.now()}`,
        title: 'Deployment Successful',
        message: `${app.name} deployed to production`,
        type: 'success',
        ts: Date.now(),
      })
    }, 6000)
  })

  // Restart an app
  socket.on('restart-app', (data: { appId: string }) => {
    const app = apps.find(a => a.id === data.appId)
    if (!app) return
    app.status = 'deploying'
    io.emit('app-status', { appId: data.appId, status: 'restarting', message: 'Graceful restart in progress...' })
    setTimeout(() => {
      app.status = 'running'
      io.emit('app-status', { appId: data.appId, status: 'running', message: 'Service back online' })
    }, 2000)
  })

  // Toggle app (start/stop)
  socket.on('toggle-app', (data: { appId: string }) => {
    const app = apps.find(a => a.id === data.appId)
    if (!app) return
    app.status = app.status === 'running' ? 'stopped' : 'running'
    if (app.status === 'stopped') {
      app.cpu = 0; app.memory = 0; app.rps = 0
    }
    io.emit('app-status', { appId: data.appId, status: app.status, message: app.status === 'running' ? 'App started' : 'App stopped' })
  })

  // Send a test push notification
  socket.on('send-push-test', (data: { title: string; message: string }) => {
    io.emit('push-notification', {
      id: `notif_${Date.now()}`,
      title: data.title || 'Test Notification',
      message: data.message || 'This is a test push notification from Nexora Cloud',
      type: 'info',
      ts: Date.now(),
    })
  })

  socket.on('disconnect', () => {
    console.log(`[Nexora Realtime] Client disconnected: ${socket.id}`)
  })
})

// Start broadcasting loops
setInterval(tick, 2000)
setInterval(pushTick, 9000)

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`[Nexora Realtime] Listening on :${PORT}`)
})
