import { db } from '@/lib/db'

const APP_TEMPLATES = [
  {
    name: 'rust-api-gateway',
    slug: 'rust-api-gateway',
    runtime: 'rust',
    framework: 'actix-web',
    region: 'fra1',
    status: 'running',
    branch: 'main',
    repoUrl: 'https://github.com/nexora/rust-api-gateway',
    port: 8080,
    instances: 4,
    memoryLimit: 1024,
    cpuLimit: 2,
    envCount: 18,
  },
  {
    name: 'php-laravel-store',
    slug: 'php-laravel-store',
    runtime: 'php',
    framework: 'laravel',
    region: 'fra1',
    status: 'running',
    branch: 'main',
    repoUrl: 'https://github.com/nexora/php-laravel-store',
    port: 9000,
    instances: 3,
    memoryLimit: 2048,
    cpuLimit: 4,
    envCount: 32,
  },
  {
    name: 'nextjs-marketing',
    slug: 'nextjs-marketing',
    runtime: 'nextjs',
    framework: 'next',
    region: 'nyc1',
    status: 'running',
    branch: 'main',
    repoUrl: 'https://github.com/nexora/nextjs-marketing',
    port: 3000,
    instances: 2,
    memoryLimit: 512,
    cpuLimit: 1,
    envCount: 12,
  },
  {
    name: 'rust-ws-hub',
    slug: 'rust-ws-hub',
    runtime: 'rust',
    framework: 'axum',
    region: 'fra1',
    status: 'running',
    branch: 'main',
    repoUrl: 'https://github.com/nexora/rust-ws-hub',
    port: 3001,
    instances: 2,
    memoryLimit: 768,
    cpuLimit: 2,
    envCount: 9,
  },
  {
    name: 'php-symfony-cms',
    slug: 'php-symfony-cms',
    runtime: 'php',
    framework: 'symfony',
    region: 'fra1',
    status: 'building',
    branch: 'develop',
    repoUrl: 'https://github.com/nexora/php-symfony-cms',
    port: 8000,
    instances: 1,
    memoryLimit: 1536,
    cpuLimit: 2,
    envCount: 24,
  },
  {
    name: 'nextjs-dashboard',
    slug: 'nextjs-dashboard',
    runtime: 'nextjs',
    framework: 'next',
    region: 'sfo1',
    status: 'running',
    branch: 'main',
    repoUrl: 'https://github.com/nexora/nextjs-dashboard',
    port: 3000,
    instances: 3,
    memoryLimit: 1024,
    cpuLimit: 2,
    envCount: 16,
  },
  {
    name: 'rust-cli-tools',
    slug: 'rust-cli-tools',
    runtime: 'rust',
    framework: 'axum',
    region: 'fra1',
    status: 'stopped',
    branch: 'main',
    repoUrl: 'https://github.com/nexora/rust-cli-tools',
    port: 8081,
    instances: 0,
    memoryLimit: 256,
    cpuLimit: 1,
    envCount: 4,
  },
]

const DATABASE_TEMPLATES = [
  { name: 'postgres-main', engine: 'postgresql', version: '16', region: 'fra1', status: 'running', size: 2, usedMb: 612, connections: 42, maxConnections: 100, host: 'db-postgres-main.internal.nexora.app', port: 5432, username: 'nexora_admin', password: '••••••••••••', ssl: true, backupEnabled: true },
  { name: 'mysql-store', engine: 'mysql', version: '8.0', region: 'fra1', status: 'running', size: 4, usedMb: 1340, connections: 78, maxConnections: 200, host: 'db-mysql-store.internal.nexora.app', port: 3306, username: 'store_user', password: '••••••••••••', ssl: true, backupEnabled: true },
  { name: 'redis-cache', engine: 'redis', version: '7.0', region: 'fra1', status: 'running', size: 1, usedMb: 89, connections: 156, maxConnections: 10000, host: 'db-redis-cache.internal.nexora.app', port: 6379, username: 'default', password: '••••••••••••', ssl: false, backupEnabled: false },
  { name: 'mongo-events', engine: 'mongodb', version: '7.0', region: 'fra1', status: 'running', size: 2, usedMb: 412, connections: 23, maxConnections: 100, host: 'db-mongo-events.internal.nexora.app', port: 27017, username: 'events_reader', password: '••••••••••••', ssl: true, backupEnabled: true },
  { name: 'sqlite-analytics', engine: 'sqlite', version: '3.45', region: 'fra1', status: 'running', size: 1, usedMb: 248, connections: 4, maxConnections: 1, host: '/data/analytics.sqlite', port: 0, username: '—', password: '—', ssl: false, backupEnabled: true },
  { name: 'mariadb-legacy', engine: 'mariadb', version: '11.4', region: 'fra1', status: 'stopped', size: 2, usedMb: 1564, connections: 0, maxConnections: 150, host: 'db-mariadb-legacy.internal.nexora.app', port: 3307, username: 'legacy_admin', password: '••••••••••••', ssl: true, backupEnabled: false },
]

const DOMAIN_TEMPLATES = [
  { domain: 'nexora.app', type: 'primary', status: 'active', sslStatus: 'active', sslExpiry: '2026-09-12', autoRenew: true, nameservers: 'ns1.nexora.app, ns2.nexora.app' },
  { domain: 'api.nexora.app', type: 'subdomain', status: 'active', sslStatus: 'active', sslExpiry: '2026-09-12', autoRenew: true },
  { domain: 'www.nexora.app', type: 'alias', status: 'active', sslStatus: 'active', sslExpiry: '2026-09-12', autoRenew: true },
  { domain: 'store.nexora.app', type: 'subdomain', status: 'active', sslStatus: 'active', sslExpiry: '2026-11-04', autoRenew: true },
  { domain: 'dashboard.nexora.app', type: 'subdomain', status: 'active', sslStatus: 'active', sslExpiry: '2026-11-04', autoRenew: true },
  { domain: 'docs.nexora.app', type: 'subdomain', status: 'pending', sslStatus: 'pending', autoRenew: true },
  { domain: '*.nexora.app', type: 'wildcard', status: 'active', sslStatus: 'active', sslExpiry: '2026-09-12', autoRenew: true },
  { domain: 'nexora.io', type: 'primary', status: 'verifying', sslStatus: 'none', autoRenew: true, nameservers: 'ns1.cloudflare.com, ns2.cloudflare.com' },
]

const TEAM_TEMPLATES = [
  { email: 'owner@nexora.app', name: 'Ahmed Hassan', role: 'owner', status: 'active', lastActive: '2026-07-24T08:30:00Z' },
  { email: 'sarah.dev@nexora.app', name: 'Sarah Khalil', role: 'admin', status: 'active', lastActive: '2026-07-24T07:15:00Z' },
  { email: 'omar.rust@nexora.app', name: 'Omar Farouk', role: 'developer', status: 'active', lastActive: '2026-07-23T22:45:00Z' },
  { email: 'layla.frontend@nexora.app', name: 'Layla Mansour', role: 'developer', status: 'active', lastActive: '2026-07-24T09:00:00Z' },
  { email: 'karim.db@nexora.app', name: 'Karim Saleh', role: 'developer', status: 'active', lastActive: '2026-07-22T18:30:00Z' },
  { email: 'nour.view@nexora.app', name: 'Nour Ehab', role: 'viewer', status: 'pending', lastActive: null },
  { email: 'youssef.mobile@nexora.app', name: 'Youssef Adel', role: 'developer', status: 'active', lastActive: '2026-07-23T11:20:00Z' },
]

const NOTIFICATION_TEMPLATES = [
  { title: 'Deployment Successful', message: 'nextjs-marketing deployed to production in 38s', type: 'success', channel: 'push', status: 'delivered', recipients: 4, delivered: 4, opened: 3 },
  { title: 'High CPU Alert', message: 'php-laravel-store CPU exceeded 80% for 5 minutes', type: 'warning', channel: 'in_app', status: 'delivered', recipients: 6, delivered: 6, opened: 4 },
  { title: 'SSL Certificate Renewed', message: 'Certificate for api.nexora.app renewed automatically', type: 'success', channel: 'email', status: 'delivered', recipients: 7, delivered: 7, opened: 5 },
  { title: 'Auto-scale Event', message: 'rust-api-gateway scaled from 2 to 4 instances', type: 'info', channel: 'in_app', status: 'delivered', recipients: 4, delivered: 4, opened: 2 },
  { title: 'Database Backup Complete', message: 'postgres-main snapshot saved (612 MB)', type: 'info', channel: 'webhook', status: 'delivered', recipients: 1, delivered: 1, opened: 1 },
  { title: 'Build Failed', message: 'php-symfony-cms build failed at composer install stage', type: 'error', channel: 'push', status: 'delivered', recipients: 5, delivered: 5, opened: 5 },
  { title: 'WebSocket Reconnect', message: 'rust-ws-hub: 142 clients reconnected after deploy', type: 'info', channel: 'in_app', status: 'delivered', recipients: 3, delivered: 3, opened: 1 },
  { title: 'DDoS Mitigated', message: 'Blocked 12,400 requests from suspicious IPs in last hour', type: 'warning', channel: 'email', status: 'delivered', recipients: 7, delivered: 7, opened: 6 },
  { title: 'New Team Member', message: 'Youssef Adel accepted the invitation as Developer', type: 'info', channel: 'in_app', status: 'delivered', recipients: 4, delivered: 4, opened: 4 },
  { title: 'Plan Upgrade', message: 'Upgraded to Enterprise plan — 50% more quota', type: 'success', channel: 'email', status: 'delivered', recipients: 1, delivered: 1, opened: 1 },
]

const ACTIVITY_TEMPLATES = [
  { action: 'deploy', resource: 'app', resourceId: 'app_3', detail: 'Deployed commit a4f9c2e to nextjs-marketing', ip: '197.45.12.88' },
  { action: 'scale', resource: 'app', resourceId: 'app_1', detail: 'Scaled rust-api-gateway from 2 to 4 instances', ip: '197.45.12.88' },
  { action: 'create_db', resource: 'database', resourceId: 'db_4', detail: 'Created MongoDB instance mongo-events', ip: '197.45.12.88' },
  { action: 'restart', resource: 'app', resourceId: 'app_2', detail: 'Restarted php-laravel-store after config update', ip: '41.232.18.9' },
  { action: 'login', resource: 'session', resourceId: null, detail: 'Signed in from Cairo, Egypt (Chrome / macOS)', ip: '197.45.12.88' },
  { action: 'update_ssl', resource: 'domain', resourceId: 'dom_1', detail: 'Renewed SSL certificate for nexora.app', ip: 'system' },
  { action: 'invite', resource: 'team', resourceId: 'tm_7', detail: 'Invited youssef.mobile@nexora.app as Developer', ip: '197.45.12.88' },
  { action: 'backup', resource: 'database', resourceId: 'db_1', detail: 'Automatic backup completed for postgres-main', ip: 'system' },
  { action: 'update_env', resource: 'app', resourceId: 'app_6', detail: 'Updated 3 environment variables in nextjs-dashboard', ip: '41.232.18.9' },
  { action: 'deploy', resource: 'app', resourceId: 'app_5', detail: 'Build failed for php-symfony-cms (composer install)', ip: '197.45.12.88' },
]

async function seed() {
  console.log('Seeding Nexora Cloud database...')

  await db.user.deleteMany()
  console.log('  Cleared existing data')

  const owner = await db.user.create({
    data: {
      email: 'owner@nexora.app',
      name: 'Ahmed Hassan',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ahmed%20Hassan&backgroundColor=10b981',
      role: 'owner',
      plan: 'enterprise',
    },
  })
  console.log('  Created owner user')

  const apps: { id: string; name: string }[] = []
  for (const tpl of APP_TEMPLATES) {
    const app = await db.app.create({
      data: {
        ...tpl,
        lastDeploy: tpl.status === 'running' ? new Date(Date.now() - Math.random() * 86400000 * 3) : null,
        userId: owner.id,
      },
    })
    apps.push({ id: app.id, name: app.name })
  }
  console.log(`  Created ${apps.length} apps`)

  const dbs: { id: string; name: string }[] = []
  for (const tpl of DATABASE_TEMPLATES) {
    const database = await db.database.create({
      data: {
        ...tpl,
        lastBackup: tpl.backupEnabled && tpl.status === 'running' ? new Date(Date.now() - Math.random() * 86400000) : null,
        userId: owner.id,
      },
    })
    dbs.push({ id: database.id, name: database.name })
  }
  console.log(`  Created ${dbs.length} databases`)

  for (let i = 0; i < DOMAIN_TEMPLATES.length; i++) {
    const tpl = DOMAIN_TEMPLATES[i]
    const targetAppId = i < apps.length && tpl.type !== 'primary' && tpl.type !== 'wildcard' ? apps[i].id : null
    await db.domain.create({
      data: {
        ...tpl,
        sslExpiry: tpl.sslExpiry ? new Date(tpl.sslExpiry) : null,
        targetAppId,
        userId: owner.id,
      },
    })
  }
  console.log(`  Created ${DOMAIN_TEMPLATES.length} domains`)

  const commits = [
    { sha: 'a4f9c2e', msg: 'feat: add streaming response support' },
    { sha: 'b71d3a8', msg: 'fix: handle null pointer in auth middleware' },
    { sha: 'c2e8f15', msg: 'perf: cache user sessions in redis' },
    { sha: 'd93a1b7', msg: 'chore: upgrade dependencies' },
    { sha: 'e5b7c84', msg: 'feat: implement push notification queue' },
    { sha: 'f8c2d91', msg: 'docs: update API reference' },
    { sha: '91e3a7b', msg: 'refactor: extract rate-limiter module' },
    { sha: '02f4c8a', msg: 'fix: race condition in websocket reconnect' },
  ]
  for (const app of apps) {
    for (let i = 0; i < 5; i++) {
      const commit = commits[Math.floor(Math.random() * commits.length)]
      const minsAgo = Math.floor(Math.random() * 60 * 24 * 7) + i * 60
      await db.deployment.create({
        data: {
          commitSha: commit.sha,
          commitMsg: commit.msg,
          branch: 'main',
          status: i === 0 && app.name === 'php-symfony-cms' ? 'failed' : 'success',
          stage: 'live',
          duration: 20 + Math.floor(Math.random() * 80),
          triggeredBy: owner.email,
          appId: app.id,
          userId: owner.id,
          createdAt: new Date(Date.now() - minsAgo * 60 * 1000),
        },
      })
    }
  }
  console.log(`  Created ${apps.length * 5} deployments`)

  const wsServices = [
    { name: 'Main Realtime Hub', endpoint: 'wss://realtime.nexora.app', connections: 1240, maxConnections: 10000, messagesPerSec: 842, bandwidthKbps: 3420, channels: 24, persistence: true, appId: apps[3].id },
    { name: 'Store Live Chat', endpoint: 'wss://chat.store.nexora.app', connections: 384, maxConnections: 5000, messagesPerSec: 156, bandwidthKbps: 920, channels: 8, persistence: true, appId: apps[1].id },
    { name: 'Dashboard Push', endpoint: 'wss://push.dashboard.nexora.app', connections: 892, maxConnections: 8000, messagesPerSec: 412, bandwidthKbps: 1840, channels: 12, persistence: false, appId: apps[5].id },
    { name: 'API Events Stream', endpoint: 'wss://events.api.nexora.app', connections: 56, maxConnections: 2000, messagesPerSec: 89, bandwidthKbps: 420, channels: 4, persistence: true, appId: apps[0].id },
  ]
  for (const ws of wsServices) {
    await db.webSocketService.create({ data: ws })
  }
  console.log(`  Created ${wsServices.length} WebSocket services`)

  for (let i = 0; i < NOTIFICATION_TEMPLATES.length; i++) {
    const tpl = NOTIFICATION_TEMPLATES[i]
    await db.notification.create({
      data: {
        ...tpl,
        payload: JSON.stringify({ source: 'system', priority: tpl.type === 'error' ? 'high' : 'normal' }),
        userId: owner.id,
        createdAt: new Date(Date.now() - i * 3600000 * 3),
      },
    })
  }
  console.log(`  Created ${NOTIFICATION_TEMPLATES.length} notifications`)

  for (let i = 0; i < ACTIVITY_TEMPLATES.length; i++) {
    const tpl = ACTIVITY_TEMPLATES[i]
    await db.activity.create({
      data: {
        ...tpl,
        userId: owner.id,
        createdAt: new Date(Date.now() - i * 1800000 - Math.random() * 600000),
      },
    })
  }
  console.log(`  Created ${ACTIVITY_TEMPLATES.length} activities`)

  for (const tpl of TEAM_TEMPLATES) {
    await db.teamMember.create({
      data: {
        ...tpl,
        lastActive: tpl.lastActive ? new Date(tpl.lastActive) : null,
        userId: owner.id,
      },
    })
  }
  console.log(`  Created ${TEAM_TEMPLATES.length} team members`)

  const logSamples = [
    { level: 'info', source: 'runtime', message: 'Server listening on port {port}' },
    { level: 'info', source: 'runtime', message: 'Worker spawned successfully (pid={pid})' },
    { level: 'info', source: 'app', message: 'GET /api/health 200 - 12ms' },
    { level: 'info', source: 'app', message: 'POST /api/auth/login 200 - 84ms' },
    { level: 'warn', source: 'app', message: 'Slow query detected (1.2s) - SELECT * FROM orders' },
    { level: 'info', source: 'app', message: 'GET /api/products 200 - 23ms' },
    { level: 'error', source: 'app', message: 'Failed to acquire connection from pool (timeout)' },
    { level: 'info', source: 'build', message: 'Build artifacts uploaded (2.4 MB)' },
    { level: 'info', source: 'system', message: 'Health check passed - instance healthy' },
    { level: 'warn', source: 'runtime', message: 'Memory usage at 78% - consider scaling' },
  ]
  for (const app of apps.slice(0, 5)) {
    for (let i = 0; i < 8; i++) {
      const sample = logSamples[Math.floor(Math.random() * logSamples.length)]
      await db.log.create({
        data: {
          level: sample.level,
          source: sample.source,
          message: sample.message.replace('{port}', String(3000 + i)).replace('{pid}', String(1000 + i)),
          appId: app.id,
          ts: new Date(Date.now() - i * 60000 - Math.random() * 30000),
        },
      })
    }
  }
  console.log(`  Created sample logs`)

  console.log('\nSeeding complete!')
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
