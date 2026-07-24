import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const activities = await db.activity.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ activities })
}
