import { db } from '@/lib/db'
import { hashPassword, encrypt } from '@/lib/security'

const APP_TEMPLATES = [
  { name: 'rust-api-gateway', slug: 'rust-api-gateway', runtime: 'rust', framework: 'actix-web', region: 'fra1', status: 'running', branch: 'main', repoUrl: 'https://github.com/nexora/rust-api-gateway', port: 8080, instances: 4, memoryLimit: 1024, cpuLimit: 2, envCount: 18 },
  { name: 'php-laravel-store', slug: 'php-laravel-store', runtime: 'php', framework: 'laravel', region: 'fra1', status: 'running', branch: 'main', repoUrl: 'https://github.com/nexora/php-laravel-store', port: 9000, instances: 3, memoryLimit: 2048, cpuLimit: 4, envCount: 32 },
  { name: 'nextjs-marketing', slug: 'nextjs-marketing', runtime: 'nextjs', framework: 'next', region: 'nyc1', status: 'running', branch: 'main', repoUrl: 'https://github.com/nexora/nextjs-marketing', port: 3000, instances: 2, memoryLimit: 512, cpuLimit: 1, envCount: 12 },
  { name: 'rust-ws-hub', slug: 'rust-ws-hub', runtime: 'rust', framework: 'axum', region: 'fra1', status: 'running', branch: 'main', repoUrl: 'https://github.com/nexora/rust-ws-hub', port: 3001, instances: 2, memoryLimit: 768, cpuLimit: 2, envCount: 9 },
  { name: 'php-symfony-cms', slug: 'php-symfony-cms', runtime: 'php', framework: 'symfony', region: 'fra1', status: 'building', branch: 'develop', repoUrl: 'https://github.com/nexora/php-symfony-cms', port: 8000, instances: 1, memoryLimit: 1536, cpuLimit: 2, envCount: 24 },
  { name: 'nextjs-dashboard', slug: 'nextjs-dashboard', runtime: 'nextjs', framework: 'next', region: 'sfo1', status: 'running', branch: 'main', repoUrl: 'https://github.com/nexora/nextjs-dashboard', port: 3000, instances: 3, memoryLimit: 1024, cpuLimit: 2, envCount: 16 },
  { name: 'rust-cli-tools', slug: 'rust-cli-tools', runtime: 'rust', framework: 'axum', region: 'fra1', status: 'stopped', branch: 'main', repoUrl: 'https://github.com/nexora/rust-cli-tools', port: 8081, instances: 0, memoryLimit: 256, cpuLimit: 1, envCount: 4 },
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

const SECRET_TEMPLATES = [
  { key: 'DATABASE_URL', value: 'postgresql://admin:secret@db-postgres-main.internal:5432/prod', type: 'database_url', environment: 'production', rotationDays: 90, usedBy: JSON.stringify(['rust-api-gateway', 'php-laravel-store', 'nextjs-dashboard']) },
  { key: 'JWT_SECRET', value: 'j7s2k8supersecretkey1234567890', type: 'string', environment: 'all', rotationDays: 30, usedBy: JSON.stringify(['rust-api-gateway', 'php-laravel-store', 'nextjs-marketing']) },
  { key: 'REDIS_URL', value: 'rediss://default:password@db-redis-cache.internal:6379', type: 'database_url', environment: 'production', rotationDays: 90, usedBy: JSON.stringify(['rust-api-gateway', 'nextjs-dashboard']) },
  { key: 'STRIPE_SECRET_KEY', value: 'sk_test_demo_key_not_real_0123456789', type: 'api_key', environment: 'production', rotationDays: 365, usedBy: JSON.stringify(['php-laravel-store']) },
  { key: 'STRIPE_WEBHOOK_SECRET', value: 'whsec_demo_webhook_not_real_0123456789', type: 'string', environment: 'production', rotationDays: 365, usedBy: JSON.stringify(['rust-api-gateway']) },
  { key: 'PUSH_PRIVATE_KEY', value: '-----BEGIN VAPID PRIVATE KEY-----\nsupersecretvapidkey-----END-----', type: 'certificate', environment: 'all', rotationDays: 365, usedBy: JSON.stringify(['rust-ws-hub', 'nextjs-marketing']) },
  { key: 'OAUTH_GOOGLE_SECRET', value: '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7890', type: 'oauth', environment: 'all', rotationDays: 365, usedBy: JSON.stringify(['rust-api-gateway', 'nextjs-marketing']) },
  { key: 'SENTRY_DSN', value: 'https://supersecret@sentry.nexora.app/1', type: 'string', environment: 'all', rotationDays: 365, usedBy: JSON.stringify(['rust-api-gateway', 'php-laravel-store', 'nextjs-marketing', 'nextjs-dashboard', 'rust-ws-hub']) },
  { key: 'AWS_ACCESS_KEY_ID', value: 'AKIASUPERSECRETKEYID123456', type: 'api_key', environment: 'production', rotationDays: 90, usedBy: JSON.stringify(['nextjs-dashboard', 'php-laravel-store']) },
  { key: 'AWS_SECRET_ACCESS_KEY', value: 'supersecretawsaccesskey1234567890abcdef', type: 'api_key', environment: 'production', rotationDays: 90, usedBy: JSON.stringify(['nextjs-dashboard', 'php-laravel-store']) },
  { key: 'ENCRYPTION_KEY', value: 'supersecretencryptionkey1234567890abcdef1234567890abcdef', type: 'string', environment: 'production', rotationDays: 365, usedBy: JSON.stringify(['rust-api-gateway']) },
  { key: 'SMTP_PASSWORD', value: 'supersecretsmtp1234567890', type: 'string', environment: 'production', rotationDays: 180, usedBy: JSON.stringify(['php-laravel-store', 'rust-api-gateway']) },
]

const FLAG_TEMPLATES = [
  { key: 'new_dashboard_v2', name: 'New Dashboard V2', description: 'Redesigned dashboard with improved layout and live metrics', type: 'percentage', percentage: 35, enabled: true, owner: 'Layla Mansour', tags: JSON.stringify(['frontend', 'ui', 'redesign']), totalEvaluations: 184200, trueEvaluations: 64470 },
  { key: 'rust_runtime_beta', name: 'Rust Runtime Beta', description: 'Enable Rust runtime for new app deployments', type: 'boolean', percentage: 100, enabled: true, owner: 'Omar Farouk', tags: JSON.stringify(['runtime', 'rust', 'beta']), totalEvaluations: 48200, trueEvaluations: 48200 },
  { key: 'checkout_flow_v3', name: 'Checkout Flow V3', description: 'New 2-step checkout with Apple Pay and Google Pay', type: 'variant', percentage: 100, enabled: true, owner: 'Sarah Khalil', tags: JSON.stringify(['commerce', 'checkout', 'mobile']), totalEvaluations: 92400, trueEvaluations: 92400 },
  { key: 'graphql_api', name: 'GraphQL API', description: 'Expose GraphQL endpoint alongside REST API', type: 'boolean', percentage: 0, enabled: false, owner: 'Ahmed Hassan', tags: JSON.stringify(['api', 'graphql', 'beta']), totalEvaluations: 12400, trueEvaluations: 0 },
  { key: 'ai_search', name: 'AI-Powered Search', description: 'Semantic search with embeddings and reranking', type: 'percentage', percentage: 20, enabled: true, owner: 'Karim Saleh', tags: JSON.stringify(['ai', 'search', 'ml']), totalEvaluations: 68400, trueEvaluations: 13680 },
  { key: 'realtime_collaboration', name: 'Realtime Collaboration', description: 'Multi-user cursors and presence indicators in dashboard', type: 'boolean', percentage: 0, enabled: false, owner: 'Youssef Adel', tags: JSON.stringify(['realtime', 'collaboration', 'alpha']), totalEvaluations: 8200, trueEvaluations: 0 },
]

const GATEWAY_ROUTE_TEMPLATES = [
  { path: '/api/v1/products', method: 'GET', targetApp: 'php-laravel-store', targetPath: '/products', status: 'active', auth: 'api_key', rateLimit: 1000, currentRps: 142, totalRequests: 1240000, avgLatency: 23, errorRate: 0.1, cacheEnabled: true, cacheTtl: 300, corsEnabled: true, retryPolicy: 2, timeoutMs: 5000 },
  { path: '/api/v1/auth/login', method: 'POST', targetApp: 'rust-api-gateway', targetPath: '/auth/login', status: 'active', auth: 'none', rateLimit: 100, currentRps: 28, totalRequests: 542000, avgLatency: 84, errorRate: 0.3, cacheEnabled: false, cacheTtl: 0, corsEnabled: true, retryPolicy: 1, timeoutMs: 3000 },
  { path: '/api/v1/users/me', method: 'GET', targetApp: 'rust-api-gateway', targetPath: '/users/me', status: 'active', auth: 'jwt', rateLimit: 500, currentRps: 67, totalRequests: 478000, avgLatency: 34, errorRate: 0.0, cacheEnabled: true, cacheTtl: 60, corsEnabled: true, retryPolicy: 2, timeoutMs: 5000 },
  { path: '/api/v1/orders', method: 'POST', targetApp: 'php-laravel-store', targetPath: '/orders', status: 'active', auth: 'jwt', rateLimit: 200, currentRps: 18, totalRequests: 312000, avgLatency: 142, errorRate: 0.4, cacheEnabled: false, cacheTtl: 0, corsEnabled: false, retryPolicy: 3, timeoutMs: 10000 },
  { path: '/api/v1/realtime/*', method: 'GET', targetApp: 'rust-ws-hub', targetPath: '/realtime/*', status: 'active', auth: 'jwt', rateLimit: 2000, currentRps: 284, totalRequests: 890000, avgLatency: 18, errorRate: 0.0, cacheEnabled: false, cacheTtl: 0, corsEnabled: true, retryPolicy: 0, timeoutMs: 60000 },
  { path: '/api/v1/search', method: 'GET', targetApp: 'rust-api-gateway', targetPath: '/search', status: 'active', auth: 'api_key', rateLimit: 800, currentRps: 92, totalRequests: 620000, avgLatency: 56, errorRate: 0.1, cacheEnabled: true, cacheTtl: 120, corsEnabled: true, retryPolicy: 2, timeoutMs: 5000 },
  { path: '/api/v1/webhooks/stripe', method: 'POST', targetApp: 'rust-api-gateway', targetPath: '/webhooks/stripe', status: 'active', auth: 'api_key', rateLimit: 50, currentRps: 3, totalRequests: 24000, avgLatency: 92, errorRate: 0.0, cacheEnabled: false, cacheTtl: 0, corsEnabled: false, retryPolicy: 5, timeoutMs: 8000 },
  { path: '/api/v1/uploads', method: 'POST', targetApp: 'nextjs-marketing', targetPath: '/uploads', status: 'paused', auth: 'jwt', rateLimit: 20, currentRps: 0, totalRequests: 12000, avgLatency: 1240, errorRate: 2.1, cacheEnabled: false, cacheTtl: 0, corsEnabled: false, retryPolicy: 1, timeoutMs: 30000 },
  { path: '/api/v1/cms/*', method: '*', targetApp: 'php-symfony-cms', targetPath: '/*', status: 'active', auth: 'oauth2', rateLimit: 300, currentRps: 12, totalRequests: 82000, avgLatency: 412, errorRate: 0.2, cacheEnabled: true, cacheTtl: 600, corsEnabled: true, retryPolicy: 1, timeoutMs: 15000 },
  { path: '/api/v1/analytics/*', method: 'GET', targetApp: 'nextjs-dashboard', targetPath: '/analytics/*', status: 'active', auth: 'oauth2', rateLimit: 100, currentRps: 12, totalRequests: 89000, avgLatency: 412, errorRate: 0.2, cacheEnabled: true, cacheTtl: 600, corsEnabled: true, retryPolicy: 1, timeoutMs: 15000 },
]

const BACKUP_TEMPLATES = [
  { name: 'postgres-main-daily-2026-07-23', resourceName: 'postgres-main', engine: 'postgresql', sizeMb: 612, status: 'completed', type: 'automatic', durationSec: 42, retentionDays: 30, region: 'fra1' },
  { name: 'mysql-store-snapshot-2026-07-22', resourceName: 'mysql-store', engine: 'mysql', sizeMb: 1340, status: 'completed', type: 'snapshot', durationSec: 78, retentionDays: 90, region: 'fra1' },
  { name: 'mongo-events-daily-2026-07-23', resourceName: 'mongo-events', engine: 'mongodb', sizeMb: 412, status: 'completed', type: 'automatic', durationSec: 28, retentionDays: 30, region: 'fra1' },
  { name: 'redis-cache-manual-2026-07-23', resourceName: 'redis-cache', engine: 'redis', sizeMb: 89, status: 'completed', type: 'manual', durationSec: 8, retentionDays: 14, region: 'fra1' },
  { name: 'postgres-main-daily-2026-07-22', resourceName: 'postgres-main', engine: 'postgresql', sizeMb: 598, status: 'completed', type: 'automatic', durationSec: 39, retentionDays: 30, region: 'fra1' },
  { name: 'mysql-store-daily-2026-07-23', resourceName: 'mysql-store', engine: 'mysql', sizeMb: 0, status: 'in_progress', type: 'automatic', durationSec: 0, retentionDays: 30, region: 'fra1' },
  { name: 'sqlite-analytics-snapshot', resourceName: 'sqlite-analytics', engine: 'sqlite', sizeMb: 248, status: 'completed', type: 'snapshot', durationSec: 12, retentionDays: 365, region: 'fra1' },
  { name: 'postgres-main-daily-2026-07-21', resourceName: 'postgres-main', engine: 'postgresql', sizeMb: 587, status: 'completed', type: 'automatic', durationSec: 36, retentionDays: 30, region: 'fra1' },
  { name: 'mongo-events-daily-2026-07-22', resourceName: 'mongo-events', engine: 'mongodb', sizeMb: 408, status: 'failed', type: 'automatic', durationSec: 5, retentionDays: 30, region: 'fra1' },
  { name: 'mysql-store-daily-2026-07-21', resourceName: 'mysql-store', engine: 'mysql', sizeMb: 1328, status: 'completed', type: 'automatic', durationSec: 71, retentionDays: 30, region: 'fra1' },
]

async function seed() {
  console.log('Seeding Nexora Cloud database...')

  await db.user.deleteMany()
  console.log('  Cleared existing data')

  const hashedPassword = await hashPassword('admin123')
  const owner = await db.user.create({
    data: {
      email: 'owner@nexora.app',
      name: 'Ahmed Hassan',
      password: hashedPassword,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ahmed%20Hassan&backgroundColor=10b981',
      role: 'owner',
      plan: 'enterprise',
    },
  })
  console.log('  Created owner user (password: admin123)')

  const apps: { id: string; name: string }[] = []
  for (const tpl of APP_TEMPLATES) {
    const app = await db.app.create({
      data: { ...tpl, lastDeploy: tpl.status === 'running' ? new Date(Date.now() - Math.random() * 86400000 * 3) : null, userId: owner.id },
    })
    apps.push({ id: app.id, name: app.name })
  }
  console.log(`  Created ${apps.length} apps`)

  const dbs: { id: string; name: string }[] = []
  for (const tpl of DATABASE_TEMPLATES) {
    const database = await db.database.create({
      data: { ...tpl, lastBackup: tpl.backupEnabled && tpl.status === 'running' ? new Date(Date.now() - Math.random() * 86400000) : null, userId: owner.id },
    })
    dbs.push({ id: database.id, name: database.name })
  }
  console.log(`  Created ${dbs.length} databases`)

  for (let i = 0; i < DOMAIN_TEMPLATES.length; i++) {
    const tpl = DOMAIN_TEMPLATES[i]
    const targetAppId = i < apps.length && tpl.type !== 'primary' && tpl.type !== 'wildcard' ? apps[i].id : null
    await db.domain.create({
      data: { ...tpl, sslExpiry: tpl.sslExpiry ? new Date(tpl.sslExpiry) : null, targetAppId, userId: owner.id },
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
          commitSha: commit.sha, commitMsg: commit.msg, branch: 'main',
          status: i === 0 && app.name === 'php-symfony-cms' ? 'failed' : 'success',
          stage: 'live', duration: 20 + Math.floor(Math.random() * 80),
          triggeredBy: owner.email, appId: app.id, userId: owner.id,
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
  for (const ws of wsServices) await db.webSocketService.create({ data: ws })
  console.log(`  Created ${wsServices.length} WebSocket services`)

  for (let i = 0; i < NOTIFICATION_TEMPLATES.length; i++) {
    const tpl = NOTIFICATION_TEMPLATES[i]
    await db.notification.create({
      data: { ...tpl, payload: JSON.stringify({ source: 'system', priority: tpl.type === 'error' ? 'high' : 'normal' }), userId: owner.id, createdAt: new Date(Date.now() - i * 3600000 * 3) },
    })
  }
  console.log(`  Created ${NOTIFICATION_TEMPLATES.length} notifications`)

  for (let i = 0; i < ACTIVITY_TEMPLATES.length; i++) {
    const tpl = ACTIVITY_TEMPLATES[i]
    await db.activity.create({
      data: { ...tpl, userId: owner.id, createdAt: new Date(Date.now() - i * 1800000 - Math.random() * 600000) },
    })
  }
  console.log(`  Created ${ACTIVITY_TEMPLATES.length} activities`)

  for (const tpl of TEAM_TEMPLATES) {
    await db.teamMember.create({
      data: { ...tpl, lastActive: tpl.lastActive ? new Date(tpl.lastActive) : null, userId: owner.id },
    })
  }
  console.log(`  Created ${TEAM_TEMPLATES.length} team members`)

  // Secrets (encrypted)
  for (const tpl of SECRET_TEMPLATES) {
    await db.secret.create({
      data: {
        key: tpl.key,
        value: encrypt(tpl.value),
        type: tpl.type,
        environment: tpl.environment,
        rotationDays: tpl.rotationDays,
        usedBy: tpl.usedBy,
        userId: owner.id,
      },
    })
  }
  console.log(`  Created ${SECRET_TEMPLATES.length} secrets (encrypted)`)

  // Feature Flags
  for (const tpl of FLAG_TEMPLATES) {
    await db.featureFlag.create({
      data: { ...tpl, variants: JSON.stringify([]), environments: JSON.stringify({}), targeting: JSON.stringify([]), userId: owner.id },
    })
  }
  console.log(`  Created ${FLAG_TEMPLATES.length} feature flags`)

  // Gateway Routes
  for (const tpl of GATEWAY_ROUTE_TEMPLATES) {
    await db.gatewayRoute.create({
      data: { ...tpl, userId: owner.id },
    })
  }
  console.log(`  Created ${GATEWAY_ROUTE_TEMPLATES.length} gateway routes`)

  // Backups
  for (const tpl of BACKUP_TEMPLATES) {
    await db.backup.create({
      data: {
        ...tpl,
        expiresAt: new Date(Date.now() + tpl.retentionDays * 86400000),
        userId: owner.id,
        createdAt: new Date(Date.now() - Math.random() * 7 * 86400000),
      },
    })
  }
  console.log(`  Created ${BACKUP_TEMPLATES.length} backups`)

  // Audit logs
  const auditActions = [
    { actor: owner.email, actorType: 'user', action: 'login', category: 'auth', resource: 'session', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Signed in via password + 2FA', severity: 'info' },
    { actor: owner.email, actorType: 'user', action: 'deploy', category: 'app', resource: 'app', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Triggered deploy a4f9c2e', severity: 'info' },
    { actor: 'system', actorType: 'system', action: 'auto_scale', category: 'app', resource: 'app', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Scaled rust-api-gateway from 2 to 4 instances', severity: 'info' },
    { actor: 'unknown', actorType: 'user', action: 'login', category: 'auth', resource: 'session', result: 'denied', ip: '94.205.34.12', userAgent: 'curl/8.0', location: 'Unknown', details: 'Failed login attempt (rate limited)', severity: 'critical' },
    { actor: 'system', actorType: 'system', action: 'ssl_renew', category: 'domain', resource: 'domain', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'SSL certificate renewed via Let\'s Encrypt', severity: 'info' },
    { actor: 'system', actorType: 'system', action: 'ddos_mitigate', category: 'security', resource: 'gateway', result: 'success', ip: 'system', userAgent: '—', location: 'fra1', details: 'Blocked 12,400 requests from 84 IPs', severity: 'critical' },
    { actor: owner.email, actorType: 'user', action: 'create_app', category: 'app', resource: 'app', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Created new Rust app: rust-cli-tools', severity: 'info' },
    { actor: owner.email, actorType: 'user', action: 'update_plan', category: 'billing', resource: 'subscription', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Upgraded from Pro to Enterprise plan', severity: 'info' },
    { actor: owner.email, actorType: 'user', action: 'create_secret', category: 'secret', resource: 'secret', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Created secret: DATABASE_URL', severity: 'warning' },
    { actor: owner.email, actorType: 'user', action: 'invite_member', category: 'team', resource: 'team', result: 'success', ip: '197.45.12.88', userAgent: 'Chrome 127 / macOS', location: 'Cairo, Egypt', details: 'Invited youssef.mobile@nexora.app as Developer', severity: 'info' },
  ]
  for (let i = 0; i < auditActions.length; i++) {
    await db.auditLog.create({
      data: { ...auditActions[i], userId: owner.id, timestamp: new Date(Date.now() - i * 3600000 * 3) },
    })
  }
  console.log(`  Created ${auditActions.length} audit logs`)

  console.log('\n✅ Seeding complete!')
  console.log('   Owner email: owner@nexora.app')
  console.log('   Password: admin123')
}

seed().catch((e) => { console.error('Seed failed:', e); process.exit(1) }).finally(async () => { await db.$disconnect() })
