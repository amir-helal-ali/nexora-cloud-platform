import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api'

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const url = new URL(req.url)
    const appId = url.searchParams.get('appId')
    const limit = Number(url.searchParams.get('limit') || 50)
    const logs = await db.log.findMany({
      where: appId ? { appId } : undefined,
      take: limit,
      orderBy: { ts: 'desc' },
    })
    return NextResponse.json({ logs })
  })
}
