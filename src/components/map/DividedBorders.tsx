'use client'

/**
 * @file 分裂国家边界线
 * @desc 绘制东西德内部分界线(经度10.5°E)，虚线+标签
 *       TODO: 朝鲜半岛38度线也应在此绘制
 */
import { geoPath } from 'd3'
import type { Feature, Geometry } from 'geojson'
import type { GeoProjection } from 'd3'

interface DividedBordersProps {
  features: Feature<Geometry>[]
  projection: GeoProjection
}

/**
 * Draws dashed border lines for divided countries (Germany, Korea)
 */
export function DividedBorders({ features, projection }: DividedBordersProps) {
  const pathGen = geoPath().projection(projection)

  // Germany: find the Germany feature to get its bounding box
  const germanyFeat = features.find(f => (f.properties as any)?.id === 'west_germany' || (f.properties as any)?.id === 'east_germany')
  if (!germanyFeat) return null

  const germanyBounds = pathGen.bounds(germanyFeat as any)
  if (!germanyBounds || germanyBounds.some(b => b.some(isNaN))) return null

  // Inner-German border approximated at longitude ~10.5°E
  // Project the lon/lat to screen coordinates
  const top = projection([10.5, 55])  // North Germany
  const bottom = projection([10.5, 47.5])  // South Germany

  if (!top || !bottom) return null

  return (
    <g className="divided-borders">
      {/* Germany divider */}
      <line
        x1={top[0]} y1={top[1]}
        x2={bottom[0]} y2={bottom[1]}
        stroke="#5a4a3a"
        strokeWidth={2}
        strokeDasharray="4,3"
        opacity={0.7}
      />
      {/* Label */}
      <text
        x={(top[0] + bottom[0]) / 2 + 8}
        y={(top[1] + bottom[1]) / 2}
        fill="#5a4a3a"
        fontSize={7}
        fontFamily="'Courier Prime', monospace"
        opacity={0.6}
        dominantBaseline="middle"
      >
        Inner-German Border
      </text>
    </g>
  )
}
