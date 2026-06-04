/**
 * @file 地图投影 Hook
 * @desc D3 geoMercator 投影，根据容器尺寸和国家数据自适应
 *       中心偏移到(20,30)以更好展示冷战焦点地区(欧亚大陆)
 */
'use client'

import { useMemo } from 'react'
import { geoMercator, geoPath, GeoPath, GeoProjection } from 'd3'
import type { Feature, Geometry } from 'geojson'

export function useProjection(
  width: number,
  height: number,
  geoFeatures: Feature<Geometry>[]
) {
  const projection = useMemo<GeoProjection>(() => {
    return geoMercator()
      .center([20, 30])
      .fitSize([width * 0.92, height * 0.88], { type: 'FeatureCollection', features: geoFeatures } as any)
  }, [width, height, geoFeatures])

  const pathGenerator = useMemo<GeoPath>(() => {
    return geoPath().projection(projection)
  }, [projection])

  return { projection, pathGenerator, width, height }
}
