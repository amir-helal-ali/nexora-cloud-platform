'use client'

import { cn } from '@/lib/utils'
import { sparkline } from '@/lib/nexora'

interface SparklineProps {
  values: number[]
  color?: string
  className?: string
  width?: number
  height?: number
  fill?: boolean
  fillColor?: string
}

export function Sparkline({
  values,
  color = 'currentColor',
  className,
  width = 100,
  height = 28,
  fill = true,
  fillColor,
}: SparklineProps) {
  const path = sparkline(values, width, height)
  if (!path) return null

  const fillPath = `${path} L ${width - 2} ${height - 2} L 2 ${height - 2} Z`
  const id = `spark-${Math.random().toString(36).substr(2, 9)}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor || color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={fillColor || color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {fill && <path d={fillPath} fill={`url(#${id})`} stroke="none" />}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
