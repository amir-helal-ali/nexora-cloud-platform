import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAuth } from '@/lib/api'

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const websockets = await db.webSocketService.findMany({ include: { app: true } })
    return NextResponse.json({ websockets })
  })
}
