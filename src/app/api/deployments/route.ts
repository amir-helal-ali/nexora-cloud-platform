import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const deployments = await db.deployment.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { app: true },
  })
  return NextResponse.json({ deployments })
}
