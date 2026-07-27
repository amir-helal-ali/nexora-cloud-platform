import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async () => {
    const { id } = await params
    const body = await req.json()
    const flag = await db.featureFlag.update({ where: { id }, data: body })
    return NextResponse.json({ flag })
  })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(req, async () => {
    const { id } = await params
    await db.featureFlag.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
