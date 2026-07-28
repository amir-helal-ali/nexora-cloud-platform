import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api'

export async function GET(req: NextRequest) {
  return withAuth(req, async ({ userId }) => {
    const activities = await db.activity.findMany({
      where: { userId },
      take: 50,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ activities })
  })
}
