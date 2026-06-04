/**
 * @file HexGrid Component
 * @desc Renders a holographic hexagonal pattern for Era III Cyber overlay.
 */
'use client'

interface HexGridProps {
  width: number
  height: number
  hexSize?: number
}

export function HexGrid({ width, height, hexSize = 30 }: HexGridProps) {
  const hexW = hexSize * 1.732
  const hexH = hexSize * 2
  const cols = Math.ceil(width / hexW) + 1
  const rows = Math.ceil(height / (hexH * 0.75)) + 1

  // Generate a single hex path centered at 0,0
  const hexPath = Array.from({ length: 6 }, (_, i) => {
    const angle = (60 * i - 30) * Math.PI / 180
    return `${i === 0 ? 'M' : 'L'}${(hexSize * Math.cos(angle)).toFixed(1)},${(hexSize * Math.sin(angle)).toFixed(1)}`
  }).join(' ') + ' Z'

  return (
    <g className="cyber-hex-grid" opacity={0.08} stroke="#ff00ff" strokeWidth={0.3} fill="none" pointerEvents="none">
      {Array.from({ length: rows }).map((_, ri) =>
        Array.from({ length: cols }).map((_, ci) => {
          const cx = ci * hexW + (ri % 2) * (hexW / 2)
          const cy = ri * hexH * 0.75
          return <path key={`${ri}_${ci}`} d={hexPath} transform={`translate(${cx},${cy})`} />
        })
      )}
    </g>
  )
}
