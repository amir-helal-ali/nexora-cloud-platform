import bcrypt from 'bcryptjs'
import { z } from 'zod'

// ─── Password hashing ───
const SALT_ROUNUNDS = 12

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ─── Encryption for secrets (simple AES-256-GCM via Node crypto) ───
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const KEY_BUFFER = Buffer.from(ENCRYPTION_KEY.padEnd(64, '0').slice(0, 64), 'hex')

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY_BUFFER, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedText: string): string {
  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', KEY_BUFFER, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  } catch {
    return encryptedText // fallback for legacy data
  }
}

// ─── Validation schemas ───
export const schemas = {
  login: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),

  register: z.object({
    email: z.string().email('Invalid email'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  createApp: z.object({
    name: z.string().min(2).max(100),
    runtime: z.enum(['rust', 'php', 'nextjs', 'node', 'static']),
    framework: z.string().optional(),
    region: z.enum(['fra1', 'nyc1', 'sfo1', 'sin1', 'syd1']).default('fra1'),
    port: z.number().int().min(1).max(65535).default(3000),
    memoryLimit: z.number().int().min(128).default(512),
    cpuLimit: z.number().int().min(1).default(1),
    branch: z.string().default('main'),
    repoUrl: z.string().url().optional().or(z.literal('')),
  }),

  createDatabase: z.object({
    name: z.string().min(2).max(100),
    engine: z.enum(['postgresql', 'mysql', 'mariadb', 'mongodb', 'redis', 'sqlite']),
    version: z.string().default('latest'),
    region: z.enum(['fra1', 'nyc1', 'sfo1', 'sin1', 'syd1']).default('fra1'),
    size: z.number().int().min(1).max(1024).default(1),
    maxConnections: z.number().int().min(1).default(100),
    username: z.string().default('admin'),
    ssl: z.boolean().default(true),
    backupEnabled: z.boolean().default(true),
  }),

  createDomain: z.object({
    domain: z.string().min(3).max(253).regex(/^[a-zA-Z0-9*.-]+$/, 'Invalid domain'),
    type: z.enum(['primary', 'subdomain', 'alias', 'wildcard']).default('subdomain'),
    targetAppId: z.string().optional(),
    autoRenew: z.boolean().default(true),
    nameservers: z.string().optional(),
  }),

  createSecret: z.object({
    key: z.string().min(2).max(100).regex(/^[A-Z0-9_]+$/, 'Key must be UPPER_SNAKE_CASE'),
    value: z.string().min(1),
    type: z.enum(['string', 'json', 'database_url', 'api_key', 'certificate', 'oauth']),
    environment: z.enum(['production', 'staging', 'development', 'all']),
    rotationDays: z.number().int().min(0).default(90),
  }),

  createFlag: z.object({
    key: z.string().min(2).max(100).regex(/^[a-z0-9_]+$/, 'Key must be lowercase_snake_case'),
    name: z.string().min(2).max(100),
    description: z.string().default(''),
    type: z.enum(['boolean', 'percentage', 'variant']),
    percentage: z.number().int().min(0).max(100).default(0),
  }),

  createNotification: z.object({
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
    channel: z.enum(['push', 'email', 'in_app', 'webhook', 'sms']).default('push'),
    recipients: z.number().int().min(1).default(1),
  }),

  createTeamMember: z.object({
    email: z.string().email(),
    name: z.string().min(2),
    role: z.enum(['admin', 'developer', 'viewer']).default('developer'),
  }),

  createGatewayRoute: z.object({
    path: z.string().min(1).startsWith('/'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', '*']),
    targetApp: z.string().min(1),
    targetPath: z.string().startsWith('/'),
    auth: z.enum(['none', 'api_key', 'jwt', 'oauth2']).default('none'),
    rateLimit: z.number().int().min(1).max(100000).default(500),
    timeoutMs: z.number().int().min(100).max(120000).default(5000),
    cacheEnabled: z.boolean().default(false),
    corsEnabled: z.boolean().default(true),
  }),

  createBackup: z.object({
    resource: z.string().min(1),
    type: z.enum(['manual', 'snapshot']).default('manual'),
  }),

  createAlertRule: z.object({
    name: z.string().min(2).max(100),
    metric: z.enum(['cpu', 'memory', 'rps', 'error_rate', 'response_time', 'connections']),
    operator: z.enum(['>', '<', '>=', '<=']),
    threshold: z.number(),
    duration: z.number().int().min(1).default(5),
    severity: z.enum(['info', 'warning', 'critical']).default('warning'),
    channels: z.array(z.string()).default(['push']),
  }),
}

// ─── Rate limiting (in-memory, sliding window) ───
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetTime }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetTime }
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore) {
      if (entry.resetTime < now) rateLimitStore.delete(key)
    }
  }, 300000).unref?.()
}

// ─── Audit log helper ───
export async function logAudit(opts: {
  db: any
  userId?: string
  actor: string
  actorType?: string
  action: string
  category?: string
  resource: string
  resourceId?: string
  result?: string
  ip: string
  userAgent?: string
  location?: string
  details: string
  severity?: string
}) {
  try {
    await opts.db.auditLog.create({
      data: {
        userId: opts.userId || null,
        actor: opts.actor,
        actorType: opts.actorType || 'user',
        action: opts.action,
        category: opts.category || 'config',
        resource: opts.resource,
        resourceId: opts.resourceId || null,
        result: opts.result || 'success',
        ip: opts.ip,
        userAgent: opts.userAgent || '',
        location: opts.location || '',
        details: opts.details,
        severity: opts.severity || 'info',
      },
    })
  } catch (e) {
    console.error('Audit log error:', e)
  }
}
