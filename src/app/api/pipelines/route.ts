import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    // Fetch real deployments grouped as pipelines
    const deployments = await db.deployment.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { app: true },
    })

    // Group deployments by app to form pipeline-like structures
    const appMap = new Map<string, any[]>()
    for (const d of deployments) {
      const key = d.appId
      if (!appMap.has(key)) appMap.set(key, [])
      appMap.get(key)!.push(d)
    }

    const pipelines = Array.from(appMap.entries()).map(([appId, deps], i) => {
      const latest = deps[0]
      const allSuccess = deps.every(d => d.status === 'success')
      const hasFailed = deps.some(d => d.status === 'failed')
      const hasRunning = deps.some(d => d.status === 'building')

      return {
        id: `p${i + 1}`,
        branch: latest.branch,
        commitSha: latest.commitSha,
        commitMsg: latest.commitMsg,
        author: latest.triggeredBy,
        triggeredAt: latest.createdAt,
        status: hasRunning ? 'running' : hasFailed ? 'failed' : 'success',
        app: latest.app.name,
        deployments: deps,
      }
    })

    return NextResponse.json({ pipelines })
  })
}
