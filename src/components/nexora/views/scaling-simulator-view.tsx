'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Sparkline } from '@/components/nexora/sparkline'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Zap, TrendingUp, TrendingDown, Cpu, MemoryStick, Server, Gauge,
  Play, Pause, RotateCw, Activity, ArrowUp, ArrowDown, Plus, Minus,
  Sparkles, AlertTriangle,
} from 'lucide-react'

interface SimulationState {
  instances: number
  rps: number
  cpuPerInstance: number
  memPerInstance: number
  avgLatency: number
  errorRate: number
  cost: number
  history: {
    rps: number[]
    cpu: number[]
    latency: number[]
  }
}

export function ScalingSimulatorView() {
  const { metrics } = useRealtime()
  const [running, setRunning] = useState(true)
  const [autoScale, setAutoScale] = useState(true)
  const [targetCpu, setTargetCpu] = useState(70)
  const [minInstances, setMinInstances] = useState(2)
  const [maxInstances, setMaxInstances] = useState(10)
  const [trafficMultiplier, setTrafficMultiplier] = useState(1)
  const [sim, setSim] = useState<SimulationState>({
    instances: 4,
    rps: 1200,
    cpuPerInstance: 45,
    memPerInstance: 58,
    avgLatency: 84,
    errorRate: 0.2,
    cost: 0.48,
    history: { rps: [], cpu: [], latency: [] },
  })

  // Simulation loop
  const tick = useCallback(() => {
    setSim(prev => {
      // Simulate incoming traffic with some variance
      const baseRps = 1200 * trafficMultiplier
      const rps = Math.max(100, baseRps + (Math.random() - 0.5) * baseRps * 0.4)

      // Calculate load per instance
      const rpsPerInstance = rps / prev.instances
      const targetCpuPct = Math.min(95, 15 + (rpsPerInstance / 400) * 60)
      const targetMemPct = Math.min(90, 30 + (rpsPerInstance / 400) * 40)
      const targetLatency = Math.max(20, 30 + (rpsPerInstance / 100) * 8)

      // Auto-scale logic
      let newInstances = prev.instances
      if (autoScale) {
        if (targetCpuPct > targetCpu + 10 && prev.instances < maxInstances) {
          newInstances = prev.instances + 1
          if (newInstances !== prev.instances) {
            toast.success(`Auto-scaled up`, { description: `${prev.instances} → ${newInstances} instances (CPU ${targetCpuPct.toFixed(0)}%)`, duration: 2000 })
          }
        } else if (targetCpuPct < targetCpu - 20 && prev.instances > minInstances) {
          newInstances = prev.instances - 1
          if (newInstances !== prev.instances) {
            toast.info(`Auto-scaled down`, { description: `${prev.instances} → ${newInstances} instances (CPU ${targetCpuPct.toFixed(0)}%)`, duration: 2000 })
          }
        }
      }

      // Error rate increases if overloaded
      const errorRate = targetCpuPct > 85 ? (targetCpuPct - 85) / 5 : 0.1

      // Cost: $0.12 per instance per hour
      const cost = newInstances * 0.12

      // Push history
      const histLen = 60
      const history = {
        rps: [...prev.history.rps, rps].slice(-histLen),
        cpu: [...prev.history.cpu, targetCpuPct].slice(-histLen),
        latency: [...prev.history.latency, targetLatency].slice(-histLen),
      }

      return {
        instances: newInstances,
        rps,
        cpuPerInstance: targetCpuPct,
        memPerInstance: targetMemPct,
        avgLatency: targetLatency,
        errorRate,
        cost,
        history,
      }
    })
  }, [trafficMultiplier, autoScale, targetCpu, minInstances, maxInstances])

  useEffect(() => {
    if (!running) return
    const t = setInterval(tick, 2000)
    return () => clearInterval(t)
  }, [running, tick])

  const addInstance = () => {
    setSim(prev => ({ ...prev, instances: Math.min(maxInstances, prev.instances + 1) }))
  }
  const removeInstance = () => {
    setSim(prev => ({ ...prev, instances: Math.max(minInstances, prev.instances - 1) }))
  }
  const reset = () => {
    setSim({
      instances: 4,
      rps: 1200,
      cpuPerInstance: 45,
      memPerInstance: 58,
      avgLatency: 84,
      errorRate: 0.2,
      cost: 0.48,
      history: { rps: [], cpu: [], latency: [] },
    })
    setTrafficMultiplier(1)
    toast.success('Simulation reset')
  }

  const triggerSpike = () => {
    setTrafficMultiplier(3)
    toast.warning('Traffic spike triggered', { description: '3x normal traffic for the next ~10s' })
    setTimeout(() => setTrafficMultiplier(1), 12000)
  }

  return (
    <div className="space-y-5">
      {/* Header banner */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-5 dark:from-violet-950/30 dark:via-purple-950/30 dark:to-fuchsia-950/30 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              <h3 className="text-sm font-semibold">Auto-Scaling Simulator</h3>
              <Badge variant="outline" className="gap-1 text-[10px] border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                <Activity className="h-2.5 w-2.5" /> Live simulation
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Adjust traffic and scaling rules to see how your fleet responds in real-time.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRunning(!running)}
              className={cn(running && 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300')}
            >
              {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {running ? 'Pause' : 'Resume'}
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCw className="h-3.5 w-3.5" /> Reset
            </Button>
            <Button size="sm" className="bg-gradient-to-br from-violet-500 to-purple-600 text-white" onClick={triggerSpike}>
              <Zap className="h-3.5 w-3.5" /> Trigger Spike
            </Button>
          </div>
        </div>
      </Card>

      {/* Live stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Active Instances</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums">{sim.instances}</span>
                <span className="text-xs text-muted-foreground">/ {maxInstances} max</span>
              </div>
            </div>
            <Server className="h-5 w-5 text-violet-500" />
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: maxInstances }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors',
                  i < sim.instances ? 'bg-violet-500' : 'bg-muted',
                )}
              />
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">CPU per Instance</div>
              <div className={cn('mt-1 text-2xl font-bold tabular-nums', sim.cpuPerInstance > 85 ? 'text-rose-600 dark:text-rose-400' : sim.cpuPerInstance > 70 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>
                {sim.cpuPerInstance.toFixed(1)}%
              </div>
            </div>
            <Cpu className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                sim.cpuPerInstance > 85 ? 'bg-rose-500' : sim.cpuPerInstance > 70 ? 'bg-amber-500' : 'bg-emerald-500',
              )}
              style={{ width: `${sim.cpuPerInstance}%` }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Avg Latency</div>
              <div className={cn('mt-1 text-2xl font-bold tabular-nums', sim.avgLatency > 300 ? 'text-rose-600 dark:text-rose-400' : sim.avgLatency > 150 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>
                {sim.avgLatency.toFixed(0)}ms
              </div>
            </div>
            <Gauge className="h-5 w-5 text-sky-500" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>P50: {(sim.avgLatency * 0.6).toFixed(0)}ms</span>
            <span>P95: {(sim.avgLatency * 1.4).toFixed(0)}ms</span>
            <span>P99: {(sim.avgLatency * 2.1).toFixed(0)}ms</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Cost (hourly)</div>
              <div className="mt-1 text-2xl font-bold tabular-nums">${sim.cost.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">${(sim.cost * 24 * 30).toFixed(0)}/month</div>
            </div>
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Charts */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold">Live Simulation</h3>
          <p className="text-xs text-muted-foreground">Real-time metrics · last 60 ticks (2s each)</p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">RPS</span>
                <span className="font-semibold tabular-nums">{sim.rps.toFixed(0)}</span>
              </div>
              <Sparkline values={sim.history.rps.length ? sim.history.rps : [0]} color="#8b5cf6" width={200} height={48} className="w-full" />
            </div>
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CPU %</span>
                <span className="font-semibold tabular-nums">{sim.cpuPerInstance.toFixed(1)}%</span>
              </div>
              <Sparkline values={sim.history.cpu.length ? sim.history.cpu : [0]} color="#10b981" width={200} height={48} className="w-full" />
            </div>
            <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Latency</span>
                <span className="font-semibold tabular-nums">{sim.avgLatency.toFixed(0)}ms</span>
              </div>
              <Sparkline values={sim.history.latency.length ? sim.history.latency : [0]} color="#0ea5e9" width={200} height={48} className="w-full" />
            </div>
          </div>

          {/* Alert if overloaded */}
          {sim.cpuPerInstance > 85 && (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Fleet is overloaded! Consider increasing max instances or enabling more aggressive auto-scaling.</span>
            </div>
          )}
          {sim.errorRate > 1 && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>High error rate: {sim.errorRate.toFixed(2)}% — users may experience failures.</span>
            </div>
          )}
        </Card>

        {/* Controls */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold">Scaling Configuration</h3>
          <p className="text-xs text-muted-foreground">Tune auto-scaling rules</p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-medium">Auto-scaling</Label>
                <p className="text-[10px] text-muted-foreground">Automatically add/remove instances</p>
              </div>
              <Switch checked={autoScale} onCheckedChange={setAutoScale} />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-xs font-medium">Target CPU</Label>
                <span className="text-xs font-semibold tabular-nums">{targetCpu}%</span>
              </div>
              <Slider
                value={[targetCpu]}
                onValueChange={(v) => setTargetCpu(v[0])}
                min={30}
                max={90}
                step={5}
                disabled={!autoScale}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Scale up when CPU exceeds this threshold</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Min Instances</Label>
                <Input
                  type="number"
                  value={minInstances}
                  onChange={(e) => setMinInstances(Number(e.target.value))}
                  min={1}
                  max={maxInstances}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Max Instances</Label>
                <Input
                  type="number"
                  value={maxInstances}
                  onChange={(e) => setMaxInstances(Number(e.target.value))}
                  min={minInstances}
                  max={50}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-xs font-medium">Traffic Multiplier</Label>
                <span className="text-xs font-semibold tabular-nums">{trafficMultiplier}x</span>
              </div>
              <Slider
                value={[trafficMultiplier]}
                onValueChange={(v) => setTrafficMultiplier(v[0])}
                min={0.1}
                max={5}
                step={0.1}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Simulate traffic load (1x = normal)</p>
            </div>

            {!autoScale && (
              <div className="rounded-md border border-border/60 p-3">
                <Label className="text-xs font-medium">Manual Scaling</Label>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={removeInstance} disabled={sim.instances <= minInstances}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-bold tabular-nums">{sim.instances}</div>
                    <div className="text-[10px] text-muted-foreground">instances</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={addInstance} disabled={sim.instances >= maxInstances}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Preset scenarios */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold">Preset Scenarios</h3>
        <p className="text-xs text-muted-foreground">Test how your fleet handles real-world situations</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: 'Black Friday', desc: '5x traffic spike for 30s', icon: TrendingUp, action: () => { setTrafficMultiplier(5); setAutoScale(true); setMaxInstances(15); toast.info('Black Friday scenario started', { description: '5x traffic · auto-scaling to 15 max' }); setTimeout(() => setTrafficMultiplier(1), 30000); }, color: 'border-rose-500/30 bg-rose-50 dark:bg-rose-950/20' },
            { name: 'Steady Growth', desc: 'Slow 2x ramp over time', icon: Activity, action: () => { setTrafficMultiplier(2); setAutoScale(true); toast.info('Steady growth scenario started', { description: '2x traffic · auto-scaling on' }); }, color: 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20' },
            { name: 'DDoS Attack', desc: '10x burst for 15s', icon: AlertTriangle, action: () => { setTrafficMultiplier(10); setAutoScale(true); setMaxInstances(20); toast.warning('DDoS simulation started', { description: '10x burst · scaling to 20 max' }); setTimeout(() => setTrafficMultiplier(1), 15000); }, color: 'border-amber-500/30 bg-amber-50 dark:bg-amber-950/20' },
            { name: 'Low Traffic', desc: '0.3x — scale down test', icon: TrendingDown, action: () => { setTrafficMultiplier(0.3); setAutoScale(true); toast.info('Low traffic scenario started', { description: '0.3x traffic · should scale down' }); }, color: 'border-sky-500/30 bg-sky-50 dark:bg-sky-950/20' },
          ].map((p, i) => {
            const Icon = p.icon
            return (
              <button
                key={i}
                onClick={p.action}
                className={cn('flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all hover:shadow-md', p.color)}
              >
                <Icon className="h-4 w-4" />
                <div className="text-sm font-semibold">{p.name}</div>
                <p className="text-[10px] text-muted-foreground">{p.desc}</p>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
