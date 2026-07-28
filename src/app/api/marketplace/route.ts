import { NextRequest, NextResponse } from 'next/server'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit, schemas } from '@/lib/security'
import { db } from '@/lib/db'

interface Integration {
  id: string; name: string; description: string; category: string;
  installed: boolean; featured: boolean; rating: number; installs: string; author: string; tags: string[];
}

const INTEGRATIONS: Integration[] = [
  { id: 'i1', name: 'PlanetScale', description: 'Serverless MySQL platform with branching, infinite scale, and zero-downtime schema changes.', category: 'databases', installed: false, featured: true, rating: 4.8, installs: '12K', author: 'PlanetScale Inc.', tags: ['mysql', 'vitess', 'serverless'] },
  { id: 'i2', name: 'Neon', description: 'Serverless Postgres with branching, instant restore, and scale-to-zero.', category: 'databases', installed: true, featured: true, rating: 4.9, installs: '8.4K', author: 'Neon Database', tags: ['postgres', 'serverless', 'branching'] },
  { id: 'i3', name: 'Sentry', description: 'Application monitoring and error tracking with stack traces, release tracking, and source maps.', category: 'observability', installed: true, featured: true, rating: 4.9, installs: '42K', author: 'Sentry.io', tags: ['errors', 'performance', 'releases'] },
  { id: 'i4', name: 'Slack', description: 'Send alerts, deployment notifications, and incident updates directly to Slack channels.', category: 'communication', installed: true, featured: true, rating: 4.8, installs: '52K', author: 'Slack', tags: ['alerts', 'notifications', 'chat'] },
  { id: 'i5', name: 'Stripe', description: 'Payments, subscriptions, billing, and marketplace payouts. PCI Level 1 certified.', category: 'commerce', installed: true, featured: true, rating: 4.9, installs: '58K', author: 'Stripe', tags: ['payments', 'billing', 'subscriptions'] },
  { id: 'i6', name: 'OpenAI', description: 'GPT-4, DALL-E, and Whisper APIs. Build AI features with chat, vision, and transcription.', category: 'ai', installed: true, featured: true, rating: 4.8, installs: '48K', author: 'OpenAI', tags: ['gpt', 'ai', 'llm'] },
  { id: 'i7', name: 'Cloudflare WAF', description: 'Web Application Firewall with OWASP rules, bot management, and DDoS protection.', category: 'security', installed: true, featured: true, rating: 4.7, installs: '38K', author: 'Cloudflare', tags: ['waf', 'ddos', 'bot'] },
  { id: 'i8', name: 'GitHub Actions', description: 'CI/CD with 10,000+ pre-built actions. Run on Linux, macOS, Windows, ARM, and GPU.', category: 'devops', installed: true, featured: true, rating: 4.9, installs: '78K', author: 'GitHub', tags: ['ci', 'cd', 'github'] },
  { id: 'i9', name: 'AWS S3', description: 'Object storage with 99.999999999% durability. Lifecycle rules, versioning, and encryption.', category: 'storage', installed: true, featured: true, rating: 4.8, installs: '62K', author: 'Amazon Web Services', tags: ['s3', 'object', 'storage'] },
  { id: 'i10', name: 'Auth0', description: 'Identity platform with SSO, MFA, passwordless, and social login. SOC 2 compliant.', category: 'security', installed: false, featured: true, rating: 4.8, installs: '26K', author: 'Okta', tags: ['auth', 'sso', 'mfa'] },
  { id: 'i11', name: 'Anthropic Claude', description: 'Claude 3 family with 200K context. Safe, accurate, and helpful AI assistant.', category: 'ai', installed: false, featured: true, rating: 4.9, installs: '24K', author: 'Anthropic', tags: ['claude', 'ai', 'llm'] },
  { id: 'i12', name: 'SendGrid', description: 'Email delivery service with templates, A/B testing, and detailed analytics.', category: 'communication', installed: true, featured: false, rating: 4.4, installs: '31K', author: 'Twilio SendGrid', tags: ['email', 'transactional', 'marketing'] },
  { id: 'i13', name: 'Upstash', description: 'Serverless Redis and Kafka with per-request pricing. REST API for edge runtimes.', category: 'databases', installed: false, featured: false, rating: 4.7, installs: '15K', author: 'Upstash', tags: ['redis', 'kafka', 'edge'] },
  { id: 'i14', name: 'MongoDB Atlas', description: 'Multi-cloud database with global clusters, automatic scaling, and built-in best practices.', category: 'databases', installed: true, featured: false, rating: 4.6, installs: '24K', author: 'MongoDB Inc.', tags: ['mongodb', 'nosql', 'atlas'] },
  { id: 'i15', name: 'Supabase', description: 'Open-source Firebase alternative with Postgres, auth, realtime, and storage.', category: 'databases', installed: false, featured: true, rating: 4.8, installs: '18K', author: 'Supabase', tags: ['postgres', 'auth', 'realtime'] },
  { id: 'i16', name: 'Datadog', description: 'Cloud monitoring as a service with infrastructure, APM, logs, and synthetic monitoring.', category: 'observability', installed: false, featured: false, rating: 4.5, installs: '28K', author: 'Datadog', tags: ['apm', 'logs', 'metrics'] },
  { id: 'i17', name: 'Docker Hub', description: 'Container registry with private repos, automated builds, and vulnerability scanning.', category: 'devops', installed: true, featured: false, rating: 4.5, installs: '45K', author: 'Docker Inc.', tags: ['containers', 'registry', 'images'] },
  { id: 'i18', name: 'Cloudflare R2', description: 'Object storage with zero egress fees. S3-compatible API for seamless migration.', category: 'storage', installed: false, featured: true, rating: 4.7, installs: '14K', author: 'Cloudflare', tags: ['r2', 'storage', 's3'] },
  { id: 'i19', name: 'Pinecone', description: 'Vector database for AI applications. Hybrid search, metadata filtering, and similarity.', category: 'ai', installed: false, featured: false, rating: 4.6, installs: '8.5K', author: 'Pinecone', tags: ['vectors', 'embeddings', 'rag'] },
  { id: 'i20', name: 'Algolia', description: 'Search and discovery with typo-tolerance, facets, and personalization. Sub-50ms globally.', category: 'commerce', installed: false, featured: false, rating: 4.7, installs: '16K', author: 'Algolia', tags: ['search', 'discovery', 'instant'] },
  { id: 'i21', name: 'Twilio', description: 'Send SMS, voice, and WhatsApp notifications. Verify users with phone OTP.', category: 'communication', installed: false, featured: false, rating: 4.5, installs: '14K', author: 'Twilio', tags: ['sms', 'voice', 'otp'] },
  { id: 'i22', name: 'Grafana Cloud', description: 'Composable observability platform with metrics, logs, traces, and profiles.', category: 'observability', installed: false, featured: false, rating: 4.7, installs: '19K', author: 'Grafana Labs', tags: ['grafana', 'prometheus', 'loki'] },
  { id: 'i23', name: 'Vault', description: 'Secrets management, encryption as a service, and identity-based access.', category: 'security', installed: true, featured: false, rating: 4.6, installs: '9.1K', author: 'HashiCorp', tags: ['secrets', 'encryption', 'identity'] },
  { id: 'i24', name: 'GitLab CI', description: 'Built-in CI/CD with auto DevOps, review apps, and security scanning.', category: 'devops', installed: false, featured: false, rating: 4.6, installs: '22K', author: 'GitLab', tags: ['ci', 'cd', 'gitlab'] },
  { id: 'i25', name: 'LogRocket', description: 'Session replay for web apps with console logs, network requests, and Redux state.', category: 'observability', installed: false, featured: false, rating: 4.6, installs: '7.2K', author: 'LogRocket', tags: ['replay', 'debugging', 'frontend'] },
  { id: 'i26', name: 'Pusher', description: 'Hosted WebSocket API with presence, channels, and client libraries for every language.', category: 'communication', installed: false, featured: false, rating: 4.6, installs: '11K', author: 'Pusher', tags: ['websocket', 'realtime', 'pubsub'] },
  { id: 'i27', name: 'UploadThing', description: 'File uploads for full-stack apps. Built-in auth, validation, and CDN delivery.', category: 'storage', installed: false, featured: false, rating: 4.5, installs: '3.8K', author: 'Ping Labs', tags: ['uploads', 'files', 'cdn'] },
  { id: 'i28', name: 'Shopify', description: 'E-commerce platform with storefront API, webhooks, and 6000+ apps.', category: 'commerce', installed: false, featured: false, rating: 4.5, installs: '12K', author: 'Shopify', tags: ['ecommerce', 'storefront', 'shopify'] },
]

let integrationsStore = [...INTEGRATIONS]

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    return NextResponse.json({ integrations: integrationsStore })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = schemas.marketplaceAction.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 })
    }
    const { integrationId, action } = body
    integrationsStore = integrationsStore.map(i =>
      i.id === integrationId ? { ...i, installed: action === 'install' } : i
    )
    const integration = integrationsStore.find(i => i.id === integrationId)
    await logAudit({ db, userId, actor: userEmail, action: action === 'install' ? 'install_integration' : 'uninstall_integration', category: 'config', resource: 'marketplace', resourceId: integrationId, ip: getClientIp(req), details: `${action === 'install' ? 'Installed' : 'Uninstalled'} integration: ${integration?.name || integrationId}`, severity: 'info' })
    return NextResponse.json({ success: true, integration, installed: action === 'install' })
  })
}
