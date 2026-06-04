/**
 * @file Era I 血渍效果
 * @desc CWS>60的国家显示血迹径向渐变(半径与透明度随CWS增加)
 *       仅 POST_WW2 时代显示
 */
'use client'

import type { Country } from '@/types'
import type { Feature, Geometry } from 'geojson'

interface BloodStainsProps {
  countries: Record<string, Country>
  features: Feature<Geometry>[]
}

export function BloodStains({ countries, features }: BloodStainsProps) {
  return (
    <g className="blood-stains">
      {features.map(f => {
        const props = f.properties as any
        if (!props?.id) return null
        const country = countries[props.id]
        if (!country || country.coldWarScore <= 60) return null

        const cws = country.coldWarScore
        const radius = 8 + (cws - 60) * 0.3
        const opacity = 0.1 + (cws - 60) * 0.015

        // Use the centroid of the feature's bbox
        const bbox = getBBox(f)
        if (!bbox) return null
        const cx = (bbox[0] + bbox[2]) / 2
        const cy = (bbox[1] + bbox[3]) / 2

        return (
          <circle
            key={props.id}
            cx={cx}
            cy={cy}
            r={Math.min(radius, 35)}
            fill="url(#blood-stain)"
            opacity={Math.min(opacity, 0.6)}
            filter="url(#blood-glow)"
          />
        )
      })}
    </g>
  )
}

function getBBox(feature: Feature<Geometry>): [number, number, number, number] | null {
  if (!feature.geometry) return null
  const coords = extractCoords(feature.geometry)
  if (coords.length === 0) return null
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const [x, y] of coords) {
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
  }
  return [minX, minY, maxX, maxY]
}

function extractCoords(geom: any): [number, number][] {
  if (!geom) return []
  if (geom.type === 'Point') return [geom.coordinates]
  if (geom.type === 'MultiPoint') return geom.coordinates
  if (geom.type === 'LineString') return geom.coordinates
  if (geom.type === 'MultiLineString') return geom.coordinates.flat()
  if (geom.type === 'Polygon') return geom.coordinates.flat()
  if (geom.type === 'MultiPolygon') return geom.coordinates.flat(2)
  if (geom.type === 'GeometryCollection') return geom.geometries.flatMap(extractCoords)
  return []
}
