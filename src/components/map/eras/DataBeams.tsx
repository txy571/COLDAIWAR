/**
 * @file DataBeams Component
 * @desc Visualizes strategic connections and tensions with glowing animated neon beams.
 */
'use client'

import { useMemo } from 'react'

interface DataBeamsProps {
  projection: any
  countries: Record<string, any>
}

// Coordinates of key geopolitical centers [lon, lat]
const HOTSPOT_COORDS: Record<string, [number, number]> = {
  usa: [-77, 39],
  ussr: [37, 55],
  cuba: [-82, 22],
  east_germany: [13, 52],
  south_korea: [127, 37],
  north_korea: [127, 40],
  vietnam: [108, 16],
  iran: [53, 32],
}

export function DataBeams({ projection, countries }: DataBeamsProps) {
  const beams = useMemo(() => {
    const list: { from: [number, number]; to: [number, number]; key: string; color: string }[] = []

    // Project coordinates
    const project = (coords: [number, number]) => {
      const p = projection(coords)
      return p ? { x: p[0], y: p[1] } : null
    }

    const ussPos = project(HOTSPOT_COORDS.usa)
    const ussrPos = project(HOTSPOT_COORDS.ussr)

    if (!ussPos || !ussrPos) return []

    // Draw links to high-CWS hotspots
    for (const [cid, coords] of Object.entries(HOTSPOT_COORDS)) {
      if (cid === 'usa' || cid === 'ussr') continue
      const countryData = countries[cid]
      if (countryData && countryData.coldWarScore > 40) {
        const destPos = project(coords)
        if (destPos) {
          // USA link (cyan)
          list.push({
            from: [ussPos.x, ussPos.y],
            to: [destPos.x, destPos.y],
            key: `usa_${cid}`,
            color: '#00ffff',
          })
          // USSR link (magenta)
          list.push({
            from: [ussrPos.x, ussrPos.y],
            to: [destPos.x, destPos.y],
            key: `ussr_${cid}`,
            color: '#ff00ff',
          })
        }
      }
    }

    return list
  }, [projection, countries])

  return (
    <g className="data-beams" pointerEvents="none">
      {beams.map((beam) => {
        const [x1, y1] = beam.from
        const [x2, y2] = beam.to
        return (
          <g key={beam.key}>
            {/* Ambient beam glow */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={beam.color}
              strokeWidth={2}
              opacity={0.15}
              strokeLinecap="round"
            />
            {/* Dynamic data core line */}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={beam.color}
              strokeWidth={0.8}
              opacity={0.8}
              strokeDasharray="4 8"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="24;0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </line>
          </g>
        )
      })}
    </g>
  )
}
