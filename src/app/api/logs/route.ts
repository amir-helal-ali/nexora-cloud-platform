import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const appId = url.searchParams.get('appId')
  const limit = Number(url.searchParams.get('limit') || 50)

  const logs = await db.log.findMany({
    where: appId ? { appId } : undefined,
    take: limit,
    orderBy: { ts: 'desc' },
  })
  return NextResponse.json({ logs })
}
