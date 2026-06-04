/**
 * @file 地图缩放 Hook
 * @desc D3 zoom behavior：滚轮缩放(1x-10x)、双击放大(3x)、拖拽平移
 *       平移限制[-500,-500]~[2000,2000]
 */
'use client'

import { useRef, useEffect, useCallback } from 'react'
import { zoom as d3Zoom, zoomIdentity, select, ZoomBehavior } from 'd3'

export function useMapZoom(svgRef: React.RefObject<SVGSVGElement | null>) {
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([[-500, -500], [2000, 2000]])
      .on('zoom', (event) => {
        const container = svg.querySelector('.map-content') as SVGGElement
        if (container) {
          container.setAttribute('transform', event.transform.toString())
        }
      })

    zoomBehaviorRef.current = zoomBehavior
    select(svg).call(zoomBehavior)

    const handleDblClick = (event: MouseEvent) => {
      event.preventDefault()
      const point: [number, number] = [event.clientX, event.clientY]
      zoomBehavior.scaleTo(select(svg).transition().duration(300), 3, point)
    }

    svg.addEventListener('dblclick', handleDblClick)

    return () => {
      select(svg).on('.zoom', null)
      svg.removeEventListener('dblclick', handleDblClick)
    }
  }, [svgRef])

  const resetZoom = useCallback(() => {
    const svg = svgRef.current
    if (!svg) return
    select(svg).transition().duration(500).call(
      zoomBehaviorRef.current!.transform,
      zoomIdentity
    )
  }, [svgRef])

  return { resetZoom }
}
