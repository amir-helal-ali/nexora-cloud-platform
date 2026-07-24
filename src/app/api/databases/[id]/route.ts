import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const updated = await db.database.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.size && { size: body.size }),
        ...(body.maxConnections && { maxConnections: body.maxConnections }),
        ...(body.backupEnabled !== undefined && { backupEnabled: body.backupEnabled }),
      },
    })
    return NextResponse.json({ database: updated })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.database.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
