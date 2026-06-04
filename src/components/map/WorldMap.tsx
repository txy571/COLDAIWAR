'use client'

/**
 * @file 世界地图容器
 * @desc 使用 ResizeObserver 自适应容器尺寸，渲染 MapCanvas
 *       提供缩放重置按钮
 */
import { useState, useCallback, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { MapCanvas } from './MapCanvas'

export function WorldMap() {
  const currentEra = useGameStore(s => s.currentEra)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [showZoomHint] = useState(true)

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node
    if (!node) return
    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      setDimensions({ width: Math.floor(rect.width), height: Math.floor(rect.height) })
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const handleResetZoom = () => {
    const svg = containerRef.current?.querySelector('svg')
    if (svg) {
      const container = svg.querySelector('.map-content') as SVGGElement
      if (container) container.setAttribute('transform', 'translate(0,0) scale(1)')
    }
  }

  return (
    <div className="absolute inset-0" data-era={currentEra.toLowerCase()}>
      <div ref={measuredRef} className="w-full h-full overflow-hidden">
        {dimensions.width > 0 && (
          <MapCanvas width={dimensions.width} height={dimensions.height} />
        )}
      </div>
      <button
        onClick={handleResetZoom}
        className="absolute top-3 left-3 text-[10px] px-2 py-1 bg-stone-700/70 text-stone-300 border border-stone-600 rounded-sm hover:bg-stone-700 transition-colors font-mono"
        title="Reset zoom"
      >
        ⊖ RESET
      </button>
    </div>
  )
}
