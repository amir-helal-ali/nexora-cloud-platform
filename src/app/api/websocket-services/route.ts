import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const websockets = await db.webSocketService.findMany({ include: { app: true } })
  return NextResponse.json({ websockets })
}
