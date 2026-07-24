import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const owner = await db.user.findFirst({ where: { role: 'owner' } })

    const updated = await db.app.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.instances !== undefined && { instances: body.instances }),
        ...(body.memoryLimit && { memoryLimit: body.memoryLimit }),
        ...(body.cpuLimit && { cpuLimit: body.cpuLimit }),
        ...(body.autoScale !== undefined && { autoScale: body.autoScale }),
        ...(body.minInstances !== undefined && { minInstances: body.minInstances }),
        ...(body.maxInstances !== undefined && { maxInstances: body.maxInstances }),
      },
    })

    if (owner && body.status) {
      await db.activity.create({
        data: {
          action: body.status === 'stopped' ? 'stop_app' : body.status === 'running' ? 'start_app' : 'update_app',
          resource: 'app',
          resourceId: id,
          detail: `Updated ${updated.name} status to ${body.status}`,
          ip: '197.45.12.88',
          userId: owner.id,
        },
      })
    }

    return NextResponse.json({ app: updated })
  } catch (e) {
    console.error('PATCH /api/apps/[id] error:', e)
    return NextResponse.json({ error: 'Failed to update app' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const app = await db.app.delete({ where: { id } })
    return NextResponse.json({ ok: true, deleted: app.name })
  } catch (e) {
    console.error('DELETE /api/apps/[id] error:', e)
    return NextResponse.json({ error: 'Failed to delete app' }, { status: 500 })
  }
}
