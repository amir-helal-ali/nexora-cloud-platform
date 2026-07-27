import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const logs = await db.auditLog.findMany({
      where: { userId },
      take: 100,
      orderBy: { timestamp: 'desc' },
    })
    return NextResponse.json({ logs })
  })
}
