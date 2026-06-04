/**
 * @file Radar Sweep Component
 * @desc Standalone SVG path and animation representing a radar scan.
 */
'use client'

interface RadarSweepProps {
  centerX: number
  centerY: number
  radius: number
}

export function RadarSweep({ centerX, centerY, radius }: RadarSweepProps) {
  return (
    <g className="radar-sweep">
      <path
        d={`M ${centerX} ${centerY} L ${centerX + radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX} ${centerY - radius} Z`}
        fill="rgba(0,255,136,0.05)"
        style={{ transformOrigin: `${centerX}px ${centerY}px` }}
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from={`0 ${centerX} ${centerY}`}
          to={`360 ${centerX} ${centerY}`}
          dur="12s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  )
}
