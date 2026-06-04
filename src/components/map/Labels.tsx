'use client'

/**
 * @file 国家标签层
 * @desc 根据多边形面积自适应字体大小(5-12px)，极小国家缩略名
 *       三时代字体与颜色：Courier Prime/Share Tech Mono/Inter
 */
import { geoPath } from 'd3'
import type { GeoProjection } from 'd3'
import type { Feature, Geometry } from 'geojson'
import { useMemo } from 'react'

interface LabelsProps {
  features: Feature<Geometry>[]
  projection: GeoProjection
  era?: string
}

export function Labels({ features, projection, era }: LabelsProps) {
  const pathGen = useMemo(() => geoPath().projection(projection), [projection])

  // Pre-compute centroid and pixel area for each feature
  const labelData = useMemo(() => {
    return features
      .map(f => {
        const props = f.properties as any
        if (!props?.id) return null
        const centroid = pathGen.centroid(f as any)
        if (!centroid || centroid.some(isNaN)) return null

        // Calculate pixel area for font size scaling
        let area = 0
        try { area = pathGen.area(f as any) } catch { area = 0 }

        return {
          id: props.id,
          name: props.name as string,
          cx: centroid[0],
          cy: centroid[1],
          area,
        }
      })
      .filter(Boolean) as { id: string; name: string; cx: number; cy: number; area: number }[]
  }, [features, pathGen])

  // Find area range for normalization
  const maxArea = useMemo(() => {
    if (labelData.length === 0) return 1
    return Math.max(...labelData.map(d => d.area), 1)
  }, [labelData])

  return (
    <g className="country-labels">
      {labelData.map(d => {
        // Font size: sqrt of normalized area, mapped to 5-12px range
        const normalizedArea = Math.sqrt(d.area / maxArea)
        const fontSize = 5 + normalizedArea * 7

        // Hide labels for extremely tiny countries (rendered area too small)
        if (fontSize < 6) return null

        // For very small countries, show abbreviated name
        const label = fontSize < 7 ? d.name.substring(0, Math.max(3, Math.floor(fontSize))) : d.name

        return (
          <g key={d.id}>
            <text
              x={d.cx}
              y={d.cy + 2}
              textAnchor="middle"
              dominantBaseline="central"
              fill={era === 'IRON_CURTAIN' ? '#00ff88' : era === 'INFO_AGE' ? '#00ffff' : '#5a4a3a'}
              fillOpacity={era === 'IRON_CURTAIN' ? 0.85 : era === 'INFO_AGE' ? 0.9 : 0.75}
              stroke={era === 'IRON_CURTAIN' ? '#000a00' : era === 'INFO_AGE' ? '#0a0015' : '#d4c5a9'}
              strokeWidth={2.5}
              strokeOpacity={0.85}
              paintOrder="stroke"
              fontFamily={era === 'IRON_CURTAIN' ? "'Share Tech Mono', monospace" : era === 'INFO_AGE' ? "'Inter', sans-serif" : "'Courier Prime', monospace"}
              fontSize={Math.max(6, Math.min(13, fontSize))}
              fontWeight="bold"
              style={{ pointerEvents: 'none' }}
            >
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
