import { describe, it, expect } from 'vitest'
import { schemas, rateLimit, encrypt, decrypt, hashPassword, verifyPassword } from '@/lib/security'

describe('Auth: Password Hashing', () => {
  it('should hash a password and verify it', async () => {
    const password = 'MySecurePass123!'
    const hash = await hashPassword(password)
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(50)
    const valid = await verifyPassword(password, hash)
    expect(valid).toBe(true)
  })

  it('should reject wrong password', async () => {
    const hash = await hashPassword('correct-password')
    const valid = await verifyPassword('wrong-password', hash)
    expect(valid).toBe(false)
  })

  it('should generate different hashes for same password (salt)', async () => {
    const hash1 = await hashPassword('same-password')
    const hash2 = await hashPassword('same-password')
    expect(hash1).not.toBe(hash2)
    expect(await verifyPassword('same-password', hash1)).toBe(true)
    expect(await verifyPassword('same-password', hash2)).toBe(true)
  })

  it('should handle empty password', async () => {
    const hash = await hashPassword('')
    expect(await verifyPassword('', hash)).toBe(true)
    expect(await verifyPassword(' ', hash)).toBe(false)
  })

  it('should handle very long password', async () => {
    const longPassword = 'a'.repeat(1000)
    const hash = await hashPassword(longPassword)
    expect(await verifyPassword(longPassword, hash)).toBe(true)
  })

  it('should handle unicode passwords', async () => {
    const password = 'مرحبا123!@#'
    const hash = await hashPassword(password)
    expect(await verifyPassword(password, hash)).toBe(true)
  })
})

describe('Validation: Create App Schema', () => {
  it('should accept valid app data', () => {
    const result = schemas.createApp.safeParse({
      name: 'my-rust-app',
      runtime: 'rust',
      region: 'fra1',
    })
    expect(result.success).toBe(true)
  })

  it('should accept all valid runtimes', () => {
    for (const rt of ['rust', 'php', 'nextjs', 'node', 'static']) {
      const result = schemas.createApp.safeParse({ name: 'test', runtime: rt })
      expect(result.success).toBe(true)
    }
  })

  it('should accept all valid regions', () => {
    for (const r of ['fra1', 'nyc1', 'sfo1', 'sin1', 'syd1']) {
      const result = schemas.createApp.safeParse({ name: 'test', runtime: 'rust', region: r })
      expect(result.success).toBe(true)
    }
  })

  it('should reject name shorter than 2 chars', () => {
    const result = schemas.createApp.safeParse({ name: 'a', runtime: 'rust' })
    expect(result.success).toBe(false)
  })

  it('should reject name longer than 100 chars', () => {
    const result = schemas.createApp.safeParse({ name: 'a'.repeat(101), runtime: 'rust' })
    expect(result.success).toBe(false)
  })

  it('should reject invalid port numbers', () => {
    const result = schemas.createApp.safeParse({ name: 'test', runtime: 'rust', port: 0 })
    expect(result.success).toBe(false)
  })

  it('should reject port > 65535', () => {
    const result = schemas.createApp.safeParse({ name: 'test', runtime: 'rust', port: 70000 })
    expect(result.success).toBe(false)
  })

  it('should apply defaults for optional fields', () => {
    const result = schemas.createApp.safeParse({ name: 'test', runtime: 'rust' })
    if (result.success) {
      expect(result.data.port).toBe(3000)
      expect(result.data.memoryLimit).toBe(512)
      expect(result.data.cpuLimit).toBe(1)
      expect(result.data.region).toBe('fra1')
    }
  })
})

describe('Validation: Create Database Schema', () => {
  it('should accept valid database data', () => {
    const result = schemas.createDatabase.safeParse({
      name: 'my-postgres',
      engine: 'postgresql',
    })
    expect(result.success).toBe(true)
  })

  it('should accept all valid engines', () => {
    for (const e of ['postgresql', 'mysql', 'mariadb', 'mongodb', 'redis', 'sqlite']) {
      const result = schemas.createDatabase.safeParse({ name: 'test', engine: e })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid engine', () => {
    const result = schemas.createDatabase.safeParse({ name: 'test', engine: 'oracle' })
    expect(result.success).toBe(false)
  })

  it('should reject size > 1024 GB', () => {
    const result = schemas.createDatabase.safeParse({ name: 'test', engine: 'redis', size: 2000 })
    expect(result.success).toBe(false)
  })
})

describe('Validation: Create Notification Schema', () => {
  it('should accept valid notification', () => {
    const result = schemas.createNotification.safeParse({
      title: 'Test Alert',
      message: 'This is a test message',
    })
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const result = schemas.createNotification.safeParse({ title: '', message: 'test' })
    expect(result.success).toBe(false)
  })

  it('should reject title > 200 chars', () => {
    const result = schemas.createNotification.safeParse({ title: 'a'.repeat(201), message: 'test' })
    expect(result.success).toBe(false)
  })

  it('should accept all valid types', () => {
    for (const t of ['info', 'success', 'warning', 'error']) {
      const result = schemas.createNotification.safeParse({ title: 'test', message: 'msg', type: t })
      expect(result.success).toBe(true)
    }
  })

  it('should accept all valid channels', () => {
    for (const c of ['push', 'email', 'in_app', 'webhook', 'sms']) {
      const result = schemas.createNotification.safeParse({ title: 'test', message: 'msg', channel: c })
      expect(result.success).toBe(true)
    }
  })
})

describe('Validation: Create Gateway Route Schema', () => {
  it('should accept valid route', () => {
    const result = schemas.createGatewayRoute.safeParse({
      path: '/api/v1/products',
      method: 'GET',
      targetApp: 'my-app',
      targetPath: '/products',
    })
    expect(result.success).toBe(true)
  })

  it('should reject path not starting with /', () => {
    const result = schemas.createGatewayRoute.safeParse({
      path: 'api/v1',
      method: 'GET',
      targetApp: 'app',
      targetPath: '/',
    })
    expect(result.success).toBe(false)
  })

  it('should accept all valid methods', () => {
    for (const m of ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', '*']) {
      const result = schemas.createGatewayRoute.safeParse({
        path: '/api', method: m, targetApp: 'app', targetPath: '/',
      })
      expect(result.success).toBe(true)
    }
  })

  it('should reject rate limit > 100000', () => {
    const result = schemas.createGatewayRoute.safeParse({
      path: '/api', method: 'GET', targetApp: 'app', targetPath: '/', rateLimit: 200000,
    })
    expect(result.success).toBe(false)
  })
})

describe('Validation: Register Schema', () => {
  it('should accept valid registration', () => {
    const result = schemas.register.safeParse({
      email: 'user@example.com',
      name: 'John Doe',
      password: 'securepass123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject password < 8 chars', () => {
    const result = schemas.register.safeParse({
      email: 'user@example.com',
      name: 'John',
      password: 'short',
    })
    expect(result.success).toBe(false)
  })

  it('should reject name < 2 chars', () => {
    const result = schemas.register.safeParse({
      email: 'user@example.com',
      name: 'J',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid email formats', () => {
    const invalidEmails = ['not-email', '@example.com', 'user@', 'user@.com', '']
    for (const email of invalidEmails) {
      const result = schemas.register.safeParse({ email, name: 'Test', password: 'password123' })
      expect(result.success).toBe(false)
    }
  })
})

describe('Validation: Create Team Member Schema', () => {
  it('should accept valid team member', () => {
    const result = schemas.createTeamMember.safeParse({
      email: 'member@example.com',
      name: 'Team Member',
      role: 'developer',
    })
    expect(result.success).toBe(true)
  })

  it('should accept all valid roles', () => {
    for (const r of ['admin', 'developer', 'viewer']) {
      const result = schemas.createTeamMember.safeParse({ email: 'test@test.com', name: 'Test', role: r })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid role', () => {
    const result = schemas.createTeamMember.safeParse({ email: 'test@test.com', name: 'Test', role: 'superadmin' })
    expect(result.success).toBe(false)
  })
})

describe('Security: Encryption Edge Cases', () => {
  it('should handle empty string', () => {
    const encrypted = encrypt('')
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe('')
  })

  it('should handle very long text', () => {
    const longText = 'x'.repeat(10000)
    const encrypted = encrypt(longText)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(longText)
  })

  it('should handle JSON data', () => {
    const json = JSON.stringify({ key: 'value', nested: { a: 1, b: [1, 2, 3] } })
    const encrypted = encrypt(json)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(json)
    expect(JSON.parse(decrypted)).toEqual({ key: 'value', nested: { a: 1, b: [1, 2, 3] } })
  })

  it('should handle newlines and tabs', () => {
    const text = 'line1\nline2\ttabbed'
    const encrypted = encrypt(text)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(text)
  })

  it('should produce different ciphertext each time (random IV)', () => {
    const text = 'same-input'
    const enc1 = encrypt(text)
    const enc2 = encrypt(text)
    const enc3 = encrypt(text)
    expect(enc1).not.toBe(enc2)
    expect(enc2).not.toBe(enc3)
    expect(enc1).not.toBe(enc3)
    // All decrypt to same value
    expect(decrypt(enc1)).toBe(text)
    expect(decrypt(enc2)).toBe(text)
    expect(decrypt(enc3)).toBe(text)
  })
})

describe('Security: Rate Limiting Edge Cases', () => {
  it('should handle concurrent requests from same IP', () => {
    const id = 'concurrent-test'
    const results = []
    for (let i = 0; i < 10; i++) {
      results.push(rateLimit(id, 10, 60000))
    }
    const allowed = results.filter(r => r.allowed)
    expect(allowed.length).toBe(10)
    const blocked = results.filter(r => !r.allowed)
    expect(blocked.length).toBe(0)
    // 11th should be blocked
    const extra = rateLimit(id, 10, 60000)
    expect(extra.allowed).toBe(false)
  })

  it('should track remaining correctly', () => {
    const id = 'remaining-test'
    for (let i = 10; i > 0; i--) {
      const result = rateLimit(id, 10, 60000)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(i - 1)
    }
  })

  it('should isolate different identifiers', () => {
    const r1 = rateLimit('ip-1', 5, 60000)
    const r2 = rateLimit('ip-2', 5, 60000)
    expect(r1.allowed).toBe(true)
    expect(r2.allowed).toBe(true)
    expect(r1.remaining).toBe(4)
    expect(r2.remaining).toBe(4)
  })
})

describe('Validation: Update Schemas (PATCH routes)', () => {
  it('should validate updateApp with partial data', () => {
    const result = schemas.updateApp.safeParse({ status: 'running' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid status in updateApp', () => {
    const result = schemas.updateApp.safeParse({ status: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('should validate updateDatabase with partial data', () => {
    const result = schemas.updateDatabase.safeParse({ size: 10 })
    expect(result.success).toBe(true)
  })

  it('should validate updateFlag toggle', () => {
    const result = schemas.updateFlag.safeParse({ enabled: true })
    expect(result.success).toBe(true)
  })

  it('should validate updateFlag percentage', () => {
    const result = schemas.updateFlag.safeParse({ percentage: 50 })
    expect(result.success).toBe(true)
  })

  it('should reject percentage > 100', () => {
    const result = schemas.updateFlag.safeParse({ percentage: 150 })
    expect(result.success).toBe(false)
  })

  it('should validate updateGatewayRoute status', () => {
    const result = schemas.updateGatewayRoute.safeParse({ status: 'paused' })
    expect(result.success).toBe(true)
  })

  it('should validate updateTeamMember role', () => {
    const result = schemas.updateTeamMember.safeParse({ role: 'admin' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid role in updateTeamMember', () => {
    const result = schemas.updateTeamMember.safeParse({ role: 'superadmin' })
    expect(result.success).toBe(false)
  })

  it('should validate updateNotification opened', () => {
    const result = schemas.updateNotification.safeParse({ opened: 1 })
    expect(result.success).toBe(true)
  })

  it('should validate updateSecret rotated', () => {
    const result = schemas.updateSecret.safeParse({ rotated: true })
    expect(result.success).toBe(true)
  })

  it('should validate deployApp with optional fields', () => {
    const result = schemas.deployApp.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should validate deployApp with commit info', () => {
    const result = schemas.deployApp.safeParse({ commitSha: 'abc1234', commitMsg: 'fix: test' })
    expect(result.success).toBe(true)
  })

  it('should validate createBackupRequest', () => {
    const result = schemas.createBackupRequest.safeParse({ resource: 'postgres-main' })
    expect(result.success).toBe(true)
  })

  it('should reject empty resource in createBackupRequest', () => {
    const result = schemas.createBackupRequest.safeParse({ resource: '' })
    expect(result.success).toBe(false)
  })

  it('should validate cdnPurge', () => {
    const result = schemas.cdnPurge.safeParse({ action: 'purge', url: '/api/test' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid action in cdnPurge', () => {
    const result = schemas.cdnPurge.safeParse({ action: 'delete' })
    expect(result.success).toBe(false)
  })

  it('should validate marketplaceAction install', () => {
    const result = schemas.marketplaceAction.safeParse({ integrationId: 'i1', action: 'install' })
    expect(result.success).toBe(true)
  })

  it('should validate marketplaceAction uninstall', () => {
    const result = schemas.marketplaceAction.safeParse({ integrationId: 'i1', action: 'uninstall' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid action in marketplaceAction', () => {
    const result = schemas.marketplaceAction.safeParse({ integrationId: 'i1', action: 'delete' })
    expect(result.success).toBe(false)
  })

  it('should validate updateProfile', () => {
    const result = schemas.updateProfile.safeParse({ name: 'Updated Name', email: 'test@example.com' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email in updateProfile', () => {
    const result = schemas.updateProfile.safeParse({ name: 'Test', email: 'not-email' })
    expect(result.success).toBe(false)
  })
})
