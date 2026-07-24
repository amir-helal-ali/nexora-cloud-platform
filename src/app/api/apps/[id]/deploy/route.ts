import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const owner = await db.user.findFirst({ where: { role: 'owner' } })
    if (!owner) return NextResponse.json({ error: 'No owner' }, { status: 400 })

    const app = await db.app.findUnique({ where: { id } })
    if (!app) return NextResponse.json({ error: 'App not found' }, { status: 404 })

    // Mark app as building
    await db.app.update({
      where: { id },
      data: { status: 'building' },
    })

    const commitSha = body.commitSha || Math.random().toString(16).substr(2, 7)
    const commitMsg = body.commitMsg || 'Triggered from dashboard'

    // Create deployment record
    const deployment = await db.deployment.create({
      data: {
        appId: id,
        userId: owner.id,
        commitSha,
        commitMsg,
        branch: app.branch,
        status: 'building',
        stage: 'cloning',
        triggeredBy: owner.email,
      },
    })

    await db.activity.create({
      data: {
        action: 'deploy',
        resource: 'app',
        resourceId: id,
        detail: `Triggered deploy ${commitSha} for ${app.name}`,
        ip: '197.45.12.88',
        userId: owner.id,
      },
    })

    // Simulate async deploy pipeline by updating stages
    const stages = [
      { stage: 'cloning', duration: 800 },
      { stage: 'installing', duration: 1500 },
      { stage: 'building', duration: 2500 },
      { stage: 'deploying', duration: 1200 },
    ]
    let totalMs = 0
    for (const s of stages) {
      setTimeout(async () => {
        try {
          await db.deployment.update({ where: { id: deployment.id }, data: { stage: s.stage } })
        } catch {}
      }, totalMs)
      totalMs += s.duration
    }

    setTimeout(async () => {
      try {
        const duration = Math.round(totalMs / 1000)
        await db.deployment.update({
          where: { id: deployment.id },
          data: { status: 'success', stage: 'live', duration },
        })
        await db.app.update({
          where: { id },
          data: { status: 'running', lastDeploy: new Date() },
        })
        await db.notification.create({
          data: {
            userId: owner.id,
            title: 'Deployment Successful',
            message: `${app.name} deployed to production in ${duration}s`,
            type: 'success',
            channel: 'push',
            status: 'delivered',
            recipients: 4,
            delivered: 4,
            opened: 0,
          },
        })
      } catch (e) {
        console.error('Deploy finalize error:', e)
      }
    }, totalMs + 200)

    return NextResponse.json({ deployment, estimatedDuration: Math.round(totalMs / 1000) })
  } catch (e) {
    console.error('POST /api/apps/[id]/deploy error:', e)
    return NextResponse.json({ error: 'Failed to deploy' }, { status: 500 })
  }
}
