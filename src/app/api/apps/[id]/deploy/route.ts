import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth, getClientIp } from '@/lib/api'
import { logAudit } from '@/lib/security'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async ({ userId, userEmail }) => {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const app = await db.app.findUnique({ where: { id } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    await db.app.update({ where: { id }, data: { status: 'building' } })
    const commitSha = body.commitSha || Math.random().toString(16).substr(2, 7)
    const commitMsg = body.commitMsg || 'Triggered from dashboard'

    const deployment = await db.deployment.create({
      data: { appId: id, userId, commitSha, commitMsg, branch: app.branch, status: 'building', stage: 'cloning', triggeredBy: userEmail },
    })

    await logAudit({ db, userId, actor: userEmail, action: 'deploy', category: 'app', resource: 'app', resourceId: id, ip: getClientIp(req), details: `Triggered deploy ${commitSha} for ${app.name}`, severity: 'info' })

    const stages = [{ stage: 'cloning', duration: 800 }, { stage: 'installing', duration: 1500 }, { stage: 'building', duration: 2500 }, { stage: 'deploying', duration: 1200 }]
    let totalMs = 0
    for (const s of stages) {
      setTimeout(async () => { try { await db.deployment.update({ where: { id: deployment.id }, data: { stage: s.stage } }) } catch {} }, totalMs)
      totalMs += s.duration
    }
    setTimeout(async () => {
      try {
        await db.deployment.update({ where: { id: deployment.id }, data: { status: 'success', stage: 'live', duration: Math.round(totalMs / 1000) } })
        await db.app.update({ where: { id }, data: { status: 'running', lastDeploy: new Date() } })
        await db.notification.create({ data: { userId, title: 'Deployment Successful', message: `${app.name} deployed to production in ${Math.round(totalMs/1000)}s`, type: 'success', channel: 'push', status: 'delivered', recipients: 4, delivered: 4, opened: 0, payload: '{}' } })
      } catch {}
    }, totalMs + 200)

    return NextResponse.json({ deployment, estimatedDuration: Math.round(totalMs / 1000) })
  })
}
