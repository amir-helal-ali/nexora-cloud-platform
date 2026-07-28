import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'
import { z } from 'zod'

// Alert rules are stored as part of the user's config — we use a simple JSON field approach
// For now, we return audit-log-based events as "alert events" and provide CRUD for rules

interface AlertRule {
  id: string
  name: string
  metric: string
  operator: string
  threshold: number
  duration: number
  enabled: boolean
  triggered: number
  lastTriggered: string | null
  severity: string
  channels: string[]
}

const DEFAULT_RULES: AlertRule[] = [
  { id: 'rule_1', name: 'High CPU Usage', metric: 'cpu', operator: '>', threshold: 80, duration: 5, enabled: true, triggered: 3, lastTriggered: '2026-07-23T15:30:00Z', severity: 'warning', channels: ['push', 'email'] },
  { id: 'rule_2', name: 'Memory Pressure', metric: 'memory', operator: '>', threshold: 90, duration: 3, enabled: true, triggered: 1, lastTriggered: '2026-07-22T08:14:00Z', severity: 'critical', channels: ['push', 'sms'] },
  { id: 'rule_3', name: 'Error Rate Spike', metric: 'error_rate', operator: '>', threshold: 5, duration: 2, enabled: true, triggered: 0, lastTriggered: null, severity: 'critical', channels: ['push', 'email', 'webhook'] },
  { id: 'rule_4', name: 'Slow Response Time', metric: 'response_time', operator: '>', threshold: 500, duration: 5, enabled: true, triggered: 2, lastTriggered: '2026-07-23T11:22:00Z', severity: 'warning', channels: ['in_app'] },
  { id: 'rule_5', name: 'Low Traffic', metric: 'rps', operator: '<', threshold: 50, duration: 10, enabled: false, triggered: 0, lastTriggered: null, severity: 'info', channels: ['in_app'] },
  { id: 'rule_6', name: 'DB Connection Pool', metric: 'connections', operator: '>', threshold: 80, duration: 3, enabled: true, triggered: 4, lastTriggered: '2026-07-23T19:45:00Z', severity: 'warning', channels: ['email'] },
]

// In-memory store (would be database in full production)
let rulesStore: AlertRule[] = [...DEFAULT_RULES]

const alertRuleSchema = z.object({
  name: z.string().min(2).max(100),
  metric: z.enum(['cpu', 'memory', 'rps', 'error_rate', 'response_time', 'connections']),
  operator: z.enum(['>', '<', '>=', '<=']),
  threshold: z.number(),
  duration: z.number().int().min(1).default(5),
  severity: z.enum(['info', 'warning', 'critical']).default('warning'),
  channels: z.array(z.string()).default(['push']),
})

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    // Get alert events from audit logs (security category)
    const auditEvents = await db.auditLog.findMany({
      where: { userId, category: 'security' },
      take: 20,
      orderBy: { timestamp: 'desc' },
    })

    // Map audit events to alert event format
    const alertEvents = auditEvents.map(ae => ({
      id: ae.id,
      ruleName: ae.details.split(' ')[0] || 'Alert',
      metric: ae.category,
      value: 0,
      threshold: 0,
      severity: ae.severity,
      status: ae.result === 'success' ? 'resolved' : 'firing',
      triggeredAt: ae.timestamp,
      resolvedAt: ae.result === 'success' ? ae.timestamp : null,
      app: ae.resource,
    }))

    return NextResponse.json({
      rules: rulesStore,
      events: alertEvents,
    })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const body = await req.json()
    const validation = alertRuleSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data
    const newRule: AlertRule = {
      id: `rule_${Date.now()}`,
      name: data.name,
      metric: data.metric,
      operator: data.operator,
      threshold: data.threshold,
      duration: data.duration,
      enabled: true,
      triggered: 0,
      lastTriggered: null,
      severity: data.severity,
      channels: data.channels,
    }
    rulesStore = [newRule, ...rulesStore]

    await logAudit({
      db, userId, actor: userEmail,
      action: 'create_alert_rule', category: 'config', resource: 'alert_rule', resourceId: newRule.id,
      ip: getClientIp(req), details: `Created alert rule: ${data.name}`,
      severity: 'info',
    })

    return NextResponse.json({ rule: newRule }, { status: 201 })
  })
}
