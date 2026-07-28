import { describe, it, expect } from 'vitest'
import { fmtNum, fmtBytes, fmtDate, fmtDuration, sparkline } from '@/lib/nexora'

describe('Utilities: Number Formatting', () => {
  it('should format numbers under 1000', () => {
    expect(fmtNum(0)).toBe('0')
    expect(fmtNum(42)).toBe('42')
    expect(fmtNum(999)).toBe('999')
  })

  it('should format thousands with K suffix', () => {
    expect(fmtNum(1000)).toBe('1.0K')
    expect(fmtNum(1500)).toBe('1.5K')
    expect(fmtNum(999999)).toBe('1000.0K')
  })

  it('should format millions with M suffix', () => {
    expect(fmtNum(1000000)).toBe('1.00M')
    expect(fmtNum(2500000)).toBe('2.50M')
    expect(fmtNum(8420000)).toBe('8.42M')
  })

  it('should handle negative numbers', () => {
    // fmtNum uses Math.max(50, ...) for rps, but for general numbers
    // it should still work — let's verify it doesn't crash
    expect(() => fmtNum(-100)).not.toThrow()
  })
})

describe('Utilities: Byte Formatting', () => {
  it('should format MB under 1024', () => {
    expect(fmtBytes(0)).toBe('0 MB')
    expect(fmtBytes(100)).toBe('100 MB')
    expect(fmtBytes(512)).toBe('512 MB')
    expect(fmtBytes(1023)).toBe('1023 MB')
  })

  it('should format GB when >= 1024 MB', () => {
    expect(fmtBytes(1024)).toBe('1.00 GB')
    expect(fmtBytes(2048)).toBe('2.00 GB')
    expect(fmtBytes(1536)).toBe('1.50 GB')
  })

  it('should format large GB values', () => {
    expect(fmtBytes(1024 * 100)).toBe('100.00 GB')
    expect(fmtBytes(1024 * 1024)).toBe('1024.00 GB')
  })
})

describe('Utilities: Date Formatting', () => {
  it('should format recent dates as "just now"', () => {
    const now = new Date()
    expect(fmtDate(now)).toBe('just now')
  })

  it('should format minutes ago', () => {
    const d = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    expect(fmtDate(d)).toBe('5m ago')
  })

  it('should format hours ago', () => {
    const d = new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    expect(fmtDate(d)).toBe('3h ago')
  })

  it('should format days ago', () => {
    const d = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    expect(fmtDate(d)).toBe('2d ago')
  })

  it('should format null as dash', () => {
    expect(fmtDate(null)).toBe('—')
  })

  it('should accept ISO string input', () => {
    const iso = new Date(Date.now() - 10 * 60 * 1000).toISOString()
    expect(fmtDate(iso)).toBe('10m ago')
  })
})

describe('Utilities: Duration Formatting', () => {
  it('should format seconds', () => {
    expect(fmtDuration(0)).toBe('0s')
    expect(fmtDuration(30)).toBe('30s')
    expect(fmtDuration(59)).toBe('59s')
  })

  it('should format minutes and seconds', () => {
    expect(fmtDuration(60)).toBe('1m 0s')
    expect(fmtDuration(90)).toBe('1m 30s')
    expect(fmtDuration(125)).toBe('2m 5s')
  })

  it('should handle large durations', () => {
    expect(fmtDuration(3600)).toBe('60m 0s')
    expect(fmtDuration(3661)).toBe('61m 1s')
  })
})

describe('Utilities: Sparkline Generation', () => {
  it('should generate SVG path for single value', () => {
    const path = sparkline([50])
    expect(path).toContain('M')
    // Single value produces only 'M' (no 'L' needed for one point)
  })

  it('should generate SVG path for multiple values', () => {
    const path = sparkline([10, 20, 30, 40, 50])
    expect(path).toContain('M')
    expect(path.split('L').length).toBeGreaterThanOrEqual(4) // 5 points = 1 M + 4 L
  })

  it('should handle empty array', () => {
    const path = sparkline([])
    expect(path).toBe('')
  })

  it('should handle all same values', () => {
    const path = sparkline([50, 50, 50, 50])
    expect(path).toContain('M')
    expect(path).toContain('L')
  })

  it('should handle decreasing values', () => {
    const path = sparkline([100, 75, 50, 25, 0])
    expect(path).toContain('M')
    expect(path).toContain('L')
  })

  it('should handle negative values', () => {
    const path = sparkline([-10, 0, 10])
    expect(path).toContain('M')
    expect(path).toContain('L')
  })

  it('should respect width and height parameters', () => {
    const path = sparkline([10, 50, 90], 200, 50)
    // Should not exceed the specified dimensions
    const coords = path.match(/[\d.]+/g)
    if (coords) {
      const xs = coords.filter((_, i) => i % 2 === 0).map(Number)
      const ys = coords.filter((_, i) => i % 2 === 1).map(Number)
      expect(Math.max(...xs)).toBeLessThanOrEqual(200)
      expect(Math.max(...ys)).toBeLessThanOrEqual(50)
    }
  })
})

describe('Utilities: RUNTIME_META', () => {
  it('should have metadata for all runtimes', async () => {
    const { RUNTIME_META } = await import('@/lib/nexora')
    expect(RUNTIME_META.rust).toBeDefined()
    expect(RUNTIME_META.php).toBeDefined()
    expect(RUNTIME_META.nextjs).toBeDefined()
    expect(RUNTIME_META.node).toBeDefined()
    expect(RUNTIME_META.static).toBeDefined()
  })

  it('should have label, color, and icon for each runtime', async () => {
    const { RUNTIME_META } = await import('@/lib/nexora')
    for (const [key, meta] of Object.entries(RUNTIME_META)) {
      expect(meta.label).toBeDefined()
      expect(meta.color).toBeDefined()
      expect(meta.bg).toBeDefined()
      expect(meta.icon).toBeDefined()
    }
  })
})

describe('Utilities: STATUS_META', () => {
  it('should have metadata for all statuses', async () => {
    const { STATUS_META } = await import('@/lib/nexora')
    const statuses = ['running', 'building', 'deploying', 'stopped', 'crashed', 'active', 'pending', 'failed', 'success']
    for (const s of statuses) {
      expect(STATUS_META[s]).toBeDefined()
      expect(STATUS_META[s].label).toBeDefined()
      expect(STATUS_META[s].color).toBeDefined()
      expect(STATUS_META[s].dot).toBeDefined()
    }
  })
})

describe('Utilities: DB_ENGINE_META', () => {
  it('should have metadata for all database engines', async () => {
    const { DB_ENGINE_META } = await import('@/lib/nexora')
    const engines = ['postgresql', 'mysql', 'mariadb', 'mongodb', 'redis', 'sqlite']
    for (const e of engines) {
      expect(DB_ENGINE_META[e]).toBeDefined()
      expect(DB_ENGINE_META[e].label).toBeDefined()
      expect(DB_ENGINE_META[e].icon).toBeDefined()
    }
  })
})

describe('Utilities: REGION_LABELS', () => {
  it('should have labels for all regions', async () => {
    const { REGION_LABELS } = await import('@/lib/nexora')
    expect(REGION_LABELS.fra1).toContain('Frankfurt')
    expect(REGION_LABELS.nyc1).toContain('New York')
    expect(REGION_LABELS.sfo1).toContain('San Francisco')
    expect(REGION_LABELS.sin1).toContain('Singapore')
    expect(REGION_LABELS.syd1).toContain('Sydney')
  })
})
