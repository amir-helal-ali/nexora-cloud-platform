/**
 * Prometheus Metrics
 * 
 * Provides a lightweight metrics collection system compatible with
 * Prometheus scraping. No external dependencies — pure implementation.
 * 
 * Metrics exposed at /api/metrics (requires authentication)
 */

interface Metric {
  name: string
  help: string
  type: 'counter' | 'gauge' | 'histogram'
  value: number
  labels?: Record<string, string>
}

// In-memory metrics store
const metricsStore = new Map<string, Metric & { count?: number; sum?: number; buckets?: Map<string, number> }>()

/**
 * Increment a counter metric
 */
export function incrementCounter(name: string, value: number = 1, labels?: Record<string, string>) {
  const key = `${name}:${JSON.stringify(labels || {})}`
  const existing = metricsStore.get(key)
  if (existing) {
    existing.value += value
  } else {
    metricsStore.set(key, {
      name,
      help: existing?.help || `Counter: ${name}`,
      type: 'counter',
      value,
      labels,
    })
  }
}

/**
 * Set a gauge metric
 */
export function setGauge(name: string, value: number, labels?: Record<string, string>, help?: string) {
  const key = `${name}:${JSON.stringify(labels || {})}`
  metricsStore.set(key, {
    name,
    help: help || `Gauge: ${name}`,
    type: 'gauge',
    value,
    labels,
  })
}

/**
 * Observe a histogram value
 */
export function observeHistogram(name: string, value: number, labels?: Record<string, string>, buckets: number[] = [0.1, 0.5, 1, 5, 10, 30, 60]) {
  const key = `${name}:${JSON.stringify(labels || {})}`
  let existing = metricsStore.get(key)
  if (!existing) {
    existing = {
      name,
      help: `Histogram: ${name}`,
      type: 'histogram',
      value: 0,
      count: 0,
      sum: 0,
      buckets: new Map(buckets.map(b => [`${b}`, 0])),
      labels,
    }
    metricsStore.set(key, existing)
  }
  existing.count = (existing.count || 0) + 1
  existing.sum = (existing.sum || 0) + value
  for (const bucket of buckets) {
    if (value <= bucket) {
      const bk = `${bucket}`
      existing.buckets!.set(bk, (existing.buckets!.get(bk) || 0) + 1)
    }
  }
}

/**
 * Format metrics in Prometheus exposition format
 */
export function formatMetrics(): string {
  const lines: string[] = []
  const seen = new Set<string>()

  for (const [, metric] of metricsStore) {
    if (!seen.has(metric.name)) {
      lines.push(`# HELP ${metric.name} ${metric.help}`)
      lines.push(`# TYPE ${metric.name} ${metric.type}`)
      seen.add(metric.name)
    }

    const labelStr = metric.labels
      ? '{' + Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',') + '}'
      : ''

    if (metric.type === 'histogram') {
      const count = metric.count || 0
      const sum = metric.sum || 0
      for (const [bucket, bucketCount] of metric.buckets || []) {
        lines.push(`${metric.name}_bucket{le="${bucket}"} ${bucketCount}`)
      }
      lines.push(`${metric.name}_bucket{le="+Inf"} ${count}`)
      lines.push(`${metric.name}_count ${count}`)
      lines.push(`${metric.name}_sum ${sum}`)
    } else {
      lines.push(`${metric.name}${labelStr} ${metric.value}`)
    }
  }

  return lines.join('\n') + '\n'
}

/**
 * Collect system metrics (called on /api/metrics request)
 */
export async function collectSystemMetrics() {
  const memUsage = process.memoryUsage()
  const cpuUsage = process.cpuUsage()

  // Process metrics
  setGauge('nexora_process_rss_bytes', memUsage.rss, undefined, 'Resident Set Size in bytes')
  setGauge('nexora_process_heap_used_bytes', memUsage.heapUsed, undefined, 'Heap used in bytes')
  setGauge('nexora_process_heap_total_bytes', memUsage.heapTotal, undefined, 'Heap total in bytes')
  setGauge('nexora_process_external_bytes', memUsage.external, undefined, 'External memory in bytes')

  // CPU metrics (microseconds)
  setGauge('nexora_process_cpu_user_microseconds', cpuUsage.user, undefined, 'User CPU time in microseconds')
  setGauge('nexora_process_cpu_system_microseconds', cpuUsage.system, undefined, 'System CPU time in microseconds')

  // Uptime
  setGauge('nexora_process_uptime_seconds', process.uptime(), undefined, 'Process uptime in seconds')

  // Event loop lag (approximate)
  const start = Date.now()
  await new Promise(resolve => setImmediate(resolve))
  const lag = Date.now() - start
  setGauge('nexora_event_loop_lag_ms', lag, undefined, 'Event loop lag in milliseconds')

  // Node.js version
  setGauge('nexora_node_version', 1, { version: process.version }, 'Node.js version (label)')

  // Environment
  setGauge('nexora_info', 1, {
    env: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  }, 'Application info')
}
