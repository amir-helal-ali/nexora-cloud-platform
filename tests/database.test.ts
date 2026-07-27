import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@/lib/db'
import { hashPassword, encrypt, decrypt } from '@/lib/security'

describe('Database: User Operations', () => {
  let testUserId: string

  afterEach(async () => {
    if (testUserId) {
      await db.user.delete({ where: { id: testUserId } }).catch(() => {})
      testUserId = ''
    }
  })

  it('should create a user with hashed password', async () => {
    const hash = await hashPassword('testpass123')
    const user = await db.user.create({
      data: {
        email: `test-${Date.now()}@nexora.app`,
        name: 'Test User',
        password: hash,
        role: 'viewer',
        plan: 'free',
      },
    })
    testUserId = user.id

    expect(user.id).toBeDefined()
    expect(user.email).toContain('@nexora.app')
    expect(user.password).not.toBe('testpass123')
    expect(user.password!.length).toBeGreaterThan(50)
    expect(user.role).toBe('viewer')
    expect(user.plan).toBe('free')
  })

  it('should enforce unique email', async () => {
    const email = `unique-${Date.now()}@nexora.app`
    const hash = await hashPassword('pass')

    await db.user.create({
      data: { email, name: 'User 1', password: hash, role: 'viewer', plan: 'free' },
    })

    await expect(
      db.user.create({
        data: { email, name: 'User 2', password: hash, role: 'viewer', plan: 'free' },
      })
    ).rejects.toThrow()
  })

  it('should update user profile', async () => {
    const user = await db.user.create({
      data: {
        email: `update-${Date.now()}@nexora.app`,
        name: 'Before Update',
        password: await hashPassword('pass'),
        role: 'viewer',
        plan: 'free',
      },
    })
    testUserId = user.id

    const updated = await db.user.update({
      where: { id: user.id },
      data: { name: 'After Update', plan: 'pro' },
    })

    expect(updated.name).toBe('After Update')
    expect(updated.plan).toBe('pro')
  })

  it('should delete user and cascade related data', async () => {
    const user = await db.user.create({
      data: {
        email: `cascade-${Date.now()}@nexora.app`,
        name: 'Cascade Test',
        password: await hashPassword('pass'),
        role: 'owner',
        plan: 'enterprise',
      },
    })
    testUserId = user.id

    // Create related data
    await db.app.create({
      data: {
        name: 'cascade-app',
        slug: `cascade-app-${Date.now()}`,
        runtime: 'rust',
        userId: user.id,
      },
    })

    await db.secret.create({
      data: {
        key: 'CASCADE_TEST',
        value: encrypt('secret-value'),
        type: 'string',
        environment: 'production',
        userId: user.id,
      },
    })

    // Delete user — should cascade
    await db.user.delete({ where: { id: user.id } })
    testUserId = ''

    const apps = await db.app.findMany({ where: { userId: user.id } })
    const secrets = await db.secret.findMany({ where: { userId: user.id } })
    expect(apps).toHaveLength(0)
    expect(secrets).toHaveLength(0)
  })
})

describe('Database: App Operations', () => {
  let testUserId: string

  beforeEach(async () => {
    const user = await db.user.create({
      data: {
        email: `apptest-${Date.now()}@nexora.app`,
        name: 'App Test User',
        password: await hashPassword('pass'),
        role: 'owner',
        plan: 'enterprise',
      },
    })
    testUserId = user.id
  })

  afterEach(async () => {
    await db.user.delete({ where: { id: testUserId } }).catch(() => {})
  })

  it('should create an app with all fields', async () => {
    const app = await db.app.create({
      data: {
        name: 'test-rust-app',
        slug: `test-rust-app-${Date.now()}`,
        runtime: 'rust',
        framework: 'actix-web',
        region: 'fra1',
        status: 'running',
        instances: 4,
        memoryLimit: 1024,
        cpuLimit: 2,
        autoScale: true,
        minInstances: 2,
        maxInstances: 10,
        envCount: 18,
        userId: testUserId,
      },
    })

    expect(app.id).toBeDefined()
    expect(app.runtime).toBe('rust')
    expect(app.instances).toBe(4)
    expect(app.autoScale).toBe(true)
  })

  it('should enforce unique slug', async () => {
    const slug = `unique-slug-${Date.now()}`
    await db.app.create({
      data: { name: 'app1', slug, runtime: 'rust', userId: testUserId },
    })

    await expect(
      db.app.create({
        data: { name: 'app2', slug, runtime: 'php', userId: testUserId },
      })
    ).rejects.toThrow()
  })

  it('should update app status', async () => {
    const app = await db.app.create({
      data: { name: 'status-test', slug: `status-test-${Date.now()}`, runtime: 'rust', userId: testUserId },
    })

    const updated = await db.app.update({
      where: { id: app.id },
      data: { status: 'building' },
    })

    expect(updated.status).toBe('building')
  })
})

describe('Database: Secret Operations', () => {
  let testUserId: string

  beforeEach(async () => {
    const user = await db.user.create({
      data: {
        email: `secret-${Date.now()}@nexora.app`,
        name: 'Secret Test User',
        password: await hashPassword('pass'),
        role: 'owner',
        plan: 'enterprise',
      },
    })
    testUserId = user.id
  })

  afterEach(async () => {
    await db.user.delete({ where: { id: testUserId } }).catch(() => {})
  })

  it('should create and retrieve encrypted secret', async () => {
    const plaintext = 'my-database-password-123'
    const encryptedValue = encrypt(plaintext)

    const secret = await db.secret.create({
      data: {
        key: `TEST_SECRET_${Date.now()}`,
        value: encryptedValue,
        type: 'string',
        environment: 'production',
        userId: testUserId,
      },
    })

    const retrieved = await db.secret.findUnique({ where: { id: secret.id } })
    expect(retrieved).not.toBeNull()
    expect(retrieved!.value).not.toBe(plaintext)
    expect(decrypt(retrieved!.value)).toBe(plaintext)
  })

  it('should enforce unique key per environment', async () => {
    const key = `UNIQUE_KEY_${Date.now()}`
    await db.secret.create({
      data: { key, value: encrypt('val1'), type: 'string', environment: 'production', userId: testUserId },
    })

    await expect(
      db.secret.create({
        data: { key, value: encrypt('val2'), type: 'string', environment: 'production', userId: testUserId },
      })
    ).rejects.toThrow()
  })

  it('should allow same key in different environments', async () => {
    const key = `MULTI_ENV_${Date.now()}`
    await db.secret.create({
      data: { key, value: encrypt('prod-val'), type: 'string', environment: 'production', userId: testUserId },
    })

    const stagingSecret = await db.secret.create({
      data: { key, value: encrypt('staging-val'), type: 'string', environment: 'staging', userId: testUserId },
    })

    expect(stagingSecret.id).toBeDefined()
    expect(decrypt(stagingSecret.value)).toBe('staging-val')
  })

  it('should rotate secret (update lastRotated)', async () => {
    const secret = await db.secret.create({
      data: { key: `ROTATE_${Date.now()}`, value: encrypt('old'), type: 'string', environment: 'production', userId: testUserId },
    })

    const oldRotated = secret.lastRotated
    await new Promise(r => setTimeout(r, 100))

    const updated = await db.secret.update({
      where: { id: secret.id },
      data: { lastRotated: new Date(), value: encrypt('new') },
    })

    expect(updated.lastRotated.getTime()).toBeGreaterThan(oldRotated.getTime())
    expect(decrypt(updated.value)).toBe('new')
  })
})

describe('Database: Feature Flag Operations', () => {
  let testUserId: string

  beforeEach(async () => {
    const user = await db.user.create({
      data: {
        email: `flags-${Date.now()}@nexora.app`,
        name: 'Flag Test User',
        password: await hashPassword('pass'),
        role: 'owner',
        plan: 'enterprise',
      },
    })
    testUserId = user.id
  })

  afterEach(async () => {
    await db.user.delete({ where: { id: testUserId } }).catch(() => {})
  })

  it('should create a boolean flag', async () => {
    const flag = await db.featureFlag.create({
      data: {
        key: `test_flag_${Date.now()}`,
        name: 'Test Flag',
        description: 'A test feature flag',
        type: 'boolean',
        enabled: false,
        userId: testUserId,
      },
    })

    expect(flag.id).toBeDefined()
    expect(flag.type).toBe('boolean')
    expect(flag.enabled).toBe(false)
  })

  it('should toggle flag enabled state', async () => {
    const flag = await db.featureFlag.create({
      data: { key: `toggle_${Date.now()}`, name: 'Toggle', type: 'boolean', userId: testUserId },
    })

    const enabled = await db.featureFlag.update({
      where: { id: flag.id },
      data: { enabled: true },
    })
    expect(enabled.enabled).toBe(true)

    const disabled = await db.featureFlag.update({
      where: { id: flag.id },
      data: { enabled: false },
    })
    expect(disabled.enabled).toBe(false)
  })

  it('should update percentage rollout', async () => {
    const flag = await db.featureFlag.create({
      data: { key: `pct_${Date.now()}`, name: 'Percentage', type: 'percentage', percentage: 0, userId: testUserId },
    })

    const updated = await db.featureFlag.update({
      where: { id: flag.id },
      data: { percentage: 50 },
    })

    expect(updated.percentage).toBe(50)
  })
})

describe('Database: Audit Log Operations', () => {
  let testUserId: string

  beforeEach(async () => {
    const user = await db.user.create({
      data: {
        email: `audit-${Date.now()}@nexora.app`,
        name: 'Audit Test User',
        password: await hashPassword('pass'),
        role: 'owner',
        plan: 'enterprise',
      },
    })
    testUserId = user.id
  })

  afterEach(async () => {
    await db.user.delete({ where: { id: testUserId } }).catch(() => {})
  })

  it('should create an audit log entry', async () => {
    const log = await db.auditLog.create({
      data: {
        userId: testUserId,
        actor: 'audit@test.com',
        action: 'create_app',
        category: 'app',
        resource: 'app',
        result: 'success',
        ip: '192.168.1.1',
        details: 'Created app: test-app',
        severity: 'info',
      },
    })

    expect(log.id).toBeDefined()
    expect(log.action).toBe('create_app')
    expect(log.severity).toBe('info')
  })

  it('should query audit logs by user', async () => {
    await db.auditLog.create({
      data: {
        userId: testUserId, actor: 'test@test.com', action: 'login', category: 'auth',
        resource: 'session', result: 'success', ip: '10.0.0.1', details: 'Login',
        severity: 'info',
      },
    })
    await db.auditLog.create({
      data: {
        userId: testUserId, actor: 'test@test.com', action: 'create_secret', category: 'secret',
        resource: 'secret', result: 'success', ip: '10.0.0.1', details: 'Created secret',
        severity: 'warning',
      },
    })

    const logs = await db.auditLog.findMany({
      where: { userId: testUserId },
      orderBy: { timestamp: 'desc' },
    })

    expect(logs).toHaveLength(2)
    expect(logs[0].action).toBe('create_secret')
  })

  it('should filter by severity', async () => {
    await db.auditLog.create({
      data: {
        userId: testUserId, actor: 'test@test.com', action: 'ddos', category: 'security',
        resource: 'gateway', result: 'success', ip: 'system', details: 'Blocked DDoS',
        severity: 'critical',
      },
    })
    await db.auditLog.create({
      data: {
        userId: testUserId, actor: 'test@test.com', action: 'login', category: 'auth',
        resource: 'session', result: 'success', ip: '10.0.0.1', details: 'Login',
        severity: 'info',
      },
    })

    const critical = await db.auditLog.findMany({
      where: { userId: testUserId, severity: 'critical' },
    })

    expect(critical).toHaveLength(1)
    expect(critical[0].action).toBe('ddos')
  })
})

describe('Database: Gateway Route Operations', () => {
  let testUserId: string

  beforeEach(async () => {
    const user = await db.user.create({
      data: {
        email: `gw-${Date.now()}@nexora.app`,
        name: 'GW Test User',
        password: await hashPassword('pass'),
        role: 'owner',
        plan: 'enterprise',
      },
    })
    testUserId = user.id
  })

  afterEach(async () => {
    await db.user.delete({ where: { id: testUserId } }).catch(() => {})
  })

  it('should create a gateway route', async () => {
    const route = await db.gatewayRoute.create({
      data: {
        path: '/api/v1/test',
        method: 'GET',
        targetApp: 'test-app',
        targetPath: '/test',
        auth: 'jwt',
        rateLimit: 500,
        userId: testUserId,
      },
    })

    expect(route.id).toBeDefined()
    expect(route.path).toBe('/api/v1/test')
    expect(route.auth).toBe('jwt')
  })

  it('should update route status (pause/activate)', async () => {
    const route = await db.gatewayRoute.create({
      data: { path: '/api/v1/pause', method: 'GET', targetApp: 'app', targetPath: '/', userId: testUserId },
    })

    const paused = await db.gatewayRoute.update({
      where: { id: route.id },
      data: { status: 'paused' },
    })
    expect(paused.status).toBe('paused')

    const active = await db.gatewayRoute.update({
      where: { id: route.id },
      data: { status: 'active' },
    })
    expect(active.status).toBe('active')
  })
})

describe('Database: Backup Operations', () => {
  let testUserId: string

  beforeEach(async () => {
    const user = await db.user.create({
      data: {
        email: `bk-${Date.now()}@nexora.app`,
        name: 'Backup Test User',
        password: await hashPassword('pass'),
        role: 'owner',
        plan: 'enterprise',
      },
    })
    testUserId = user.id
  })

  afterEach(async () => {
    await db.user.delete({ where: { id: testUserId } }).catch(() => {})
  })

  it('should create a backup with expiration', async () => {
    const expiresAt = new Date(Date.now() + 30 * 86400000)
    const backup = await db.backup.create({
      data: {
        name: 'test-backup',
        resourceName: 'postgres-test',
        engine: 'postgresql',
        sizeMb: 512,
        status: 'completed',
        type: 'automatic',
        durationSec: 42,
        retentionDays: 30,
        expiresAt,
        userId: testUserId,
      },
    })

    expect(backup.id).toBeDefined()
    expect(backup.expiresAt).toEqual(expiresAt)
    expect(backup.status).toBe('completed')
  })

  it('should update backup status (queued → completed)', async () => {
    const backup = await db.backup.create({
      data: {
        name: 'status-test',
        resourceName: 'mysql-test',
        status: 'queued',
        type: 'manual',
        retentionDays: 14,
        expiresAt: new Date(Date.now() + 14 * 86400000),
        userId: testUserId,
      },
    })

    const completed = await db.backup.update({
      where: { id: backup.id },
      data: { status: 'completed', sizeMb: 256, durationSec: 30 },
    })

    expect(completed.status).toBe('completed')
    expect(completed.sizeMb).toBe(256)
  })
})
