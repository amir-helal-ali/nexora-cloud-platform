import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api'

// CDN edge locations (static config — would come from CDN provider API in production)
const EDGE_LOCATIONS = [
  { id: 'l1', city: 'Frankfurt', country: 'Germany', flag: '🇩🇪', region: 'EU', requests: 2840000, cacheHitRate: 94.2, latency: 12, bandwidthMbps: 142, status: 'online' },
  { id: 'l2', city: 'London', country: 'UK', flag: '🇬🇧', region: 'EU', requests: 1620000, cacheHitRate: 91.8, latency: 18, bandwidthMbps: 89, status: 'online' },
  { id: 'l3', city: 'New York', country: 'USA', flag: '🇺🇸', region: 'NA', requests: 1840000, cacheHitRate: 89.4, latency: 24, bandwidthMbps: 124, status: 'online' },
  { id: 'l4', city: 'San Francisco', country: 'USA', flag: '🇺🇸', region: 'NA', requests: 980000, cacheHitRate: 87.1, latency: 42, bandwidthMbps: 68, status: 'online' },
  { id: 'l5', city: 'Singapore', country: 'Singapore', flag: '🇸🇬', region: 'ASIA', requests: 620000, cacheHitRate: 92.5, latency: 28, bandwidthMbps: 45, status: 'online' },
  { id: 'l6', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', region: 'ASIA', requests: 480000, cacheHitRate: 90.3, latency: 32, bandwidthMbps: 38, status: 'online' },
  { id: 'l7', city: 'Mumbai', country: 'India', flag: '🇮🇳', region: 'ASIA', requests: 380000, cacheHitRate: 85.7, latency: 48, bandwidthMbps: 28, status: 'online' },
  { id: 'l8', city: 'Dubai', country: 'UAE', flag: '🇦🇪', region: 'ME', requests: 420000, cacheHitRate: 88.2, latency: 38, bandwidthMbps: 32, status: 'online' },
  { id: 'l9', city: 'Cairo', country: 'Egypt', flag: '🇪🇬', region: 'AF', requests: 280000, cacheHitRate: 86.4, latency: 28, bandwidthMbps: 22, status: 'online' },
  { id: 'l10', city: 'Cape Town', country: 'South Africa', flag: '🇿🇦', region: 'AF', requests: 89000, cacheHitRate: 82.1, latency: 68, bandwidthMbps: 8, status: 'degraded' },
  { id: 'l11', city: 'São Paulo', country: 'Brazil', flag: '🇧🇷', region: 'SA', requests: 240000, cacheHitRate: 84.6, latency: 58, bandwidthMbps: 18, status: 'online' },
  { id: 'l12', city: 'Sydney', country: 'Australia', flag: '🇦🇺', region: 'OCE', requests: 180000, cacheHitRate: 88.9, latency: 52, bandwidthMbps: 14, status: 'online' },
]

const CACHE_RULES = [
  { id: 'c1', pattern: '/_next/static/*', type: 'cache', ttl: 31536000, status: 'active', hits: 8420000, size: 124 },
  { id: 'c2', pattern: '/assets/*', type: 'cache', ttl: 86400, status: 'active', hits: 3120000, size: 89 },
  { id: 'c3', pattern: '/images/*', type: 'cache', ttl: 604800, status: 'active', hits: 1840000, size: 248 },
  { id: 'c4', pattern: '/api/*', type: 'bypass', ttl: 0, status: 'active', hits: 0, size: 0 },
  { id: 'c5', pattern: '/webhooks/*', type: 'bypass', ttl: 0, status: 'active', hits: 0, size: 0 },
  { id: 'c6', pattern: '/*.mp4', type: 'cache', ttl: 2592000, status: 'active', hits: 480000, size: 1840 },
  { id: 'c7', pattern: '/docs/*', type: 'cache', ttl: 3600, status: 'active', hits: 920000, size: 38 },
  { id: 'c8', pattern: '/cdn-cgi/*', type: 'bypass', ttl: 0, status: 'active', hits: 0, size: 0 },
  { id: 'c9', pattern: '/old-blog/*', type: 'redirect', ttl: 0, status: 'active', hits: 12000, size: 0 },
  { id: 'c10', pattern: '/uploads/*', type: 'cache', ttl: 1209600, status: 'paused', hits: 84000, size: 92 },
]

export async function GET(req: NextRequest) {
  return withAuth(req, async () => {
    const totalRequests = EDGE_LOCATIONS.reduce((s, l) => s + l.requests, 0)
    const avgHitRate = EDGE_LOCATIONS.reduce((s, l) => s + l.cacheHitRate, 0) / EDGE_LOCATIONS.length
    const totalBandwidth = EDGE_LOCATIONS.reduce((s, l) => s + l.bandwidthMbps, 0)
    const totalCacheSize = CACHE_RULES.reduce((s, r) => s + r.size, 0)
    const onlineLocations = EDGE_LOCATIONS.filter(l => l.status === 'online').length

    return NextResponse.json({
      edgeLocations: EDGE_LOCATIONS,
      cacheRules: CACHE_RULES,
      stats: {
        onlineLocations,
        totalLocations: EDGE_LOCATIONS.length,
        totalRequests,
        avgHitRate,
        totalBandwidth,
        totalCacheSize,
      },
    })
  })
}

export async function POST(req: NextRequest) {
  return withAuth(req, async () => {
    const body = await req.json()
    const { action, url } = body

    if (action === 'purge') {
      // In production, this would call the CDN provider's purge API
      return NextResponse.json({
        success: true,
        message: `Purged ${url || 'all'} from ${EDGE_LOCATIONS.length} edge locations`,
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  })
}
