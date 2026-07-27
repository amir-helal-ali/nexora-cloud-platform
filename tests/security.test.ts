import { describe, it, expect } from 'vitest'
import { schemas, rateLimit, encrypt, decrypt } from '@/lib/security'

describe('Security: Validation Schemas', () => {
  it('should validate a correct login payload', () => {
    const result = schemas.login.safeParse({
      email: 'test@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should reject an invalid email', () => {
    const result = schemas.login.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject a password shorter than 6 chars', () => {
    const result = schemas.login.safeParse({
      email: 'test@example.com',
      password: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('should validate a correct register payload', () => {
    const result = schemas.register.safeParse({
      email: 'new@example.com',
      name: 'Test User',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('should validate createApp schema with valid data', () => {
    const result = schemas.createApp.safeParse({
      name: 'my-rust-app',
      runtime: 'rust',
      region: 'fra1',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid runtime', () => {
    const result = schemas.createApp.safeParse({
      name: 'my-app',
      runtime: 'python',
      region: 'fra1',
    })
    expect(result.success).toBe(false)
  })

  it('should validate createSecret schema', () => {
    const result = schemas.createSecret.safeParse({
      key: 'DATABASE_URL',
      value: 'postgresql://localhost:5432/db',
      type: 'database_url',
      environment: 'production',
    })
    expect(result.success).toBe(true)
  })

  it('should reject lowercase secret key', () => {
    const result = schemas.createSecret.safeParse({
      key: 'database_url',
      value: 'postgresql://localhost:5432/db',
      type: 'database_url',
      environment: 'production',
    })
    expect(result.success).toBe(false)
  })

  it('should validate createDomain schema', () => {
    const result = schemas.createDomain.safeParse({
      domain: 'example.com',
      type: 'primary',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid domain', () => {
    const result = schemas.createDomain.safeParse({
      domain: 'not a domain',
      type: 'primary',
    })
    expect(result.success).toBe(false)
  })
})

describe('Security: Rate Limiting', () => {
  it('should allow first request', () => {
    const result = rateLimit('test-ip-1', 10, 60000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(9)
  })

  it('should block after exceeding limit', () => {
    const id = 'test-ip-2'
    for (let i = 0; i < 5; i++) {
      rateLimit(id, 5, 60000)
    }
    const result = rateLimit(id, 5, 60000)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('should reset after window expires', () => {
    const id = 'test-ip-3'
    const result = rateLimit(id, 100, 1) // 1ms window
    expect(result.allowed).toBe(true)
    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const result2 = rateLimit(id, 100, 1)
        expect(result2.allowed).toBe(true)
        resolve()
      }, 10)
    })
  })
})

describe('Security: Encryption', () => {
  it('should encrypt and decrypt text correctly', () => {
    const plaintext = 'my-secret-value-12345'
    const encrypted = encrypt(plaintext)
    expect(encrypted).not.toBe(plaintext)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('should produce different ciphertexts for same plaintext (random IV)', () => {
    const plaintext = 'same-secret'
    const enc1 = encrypt(plaintext)
    const enc2 = encrypt(plaintext)
    expect(enc1).not.toBe(enc2) // Different IVs = different ciphertexts
    expect(decrypt(enc1)).toBe(plaintext)
    expect(decrypt(enc2)).toBe(plaintext)
  })

  it('should handle special characters', () => {
    const plaintext = 'p@ssw0rd!#$%^&*()_+-=[]{}|;:,.<>?'
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })

  it('should handle unicode/Arabic text', () => {
    const plaintext = 'مرحبا بك في منصة Nexora'
    const encrypted = encrypt(plaintext)
    const decrypted = decrypt(encrypted)
    expect(decrypted).toBe(plaintext)
  })
})
