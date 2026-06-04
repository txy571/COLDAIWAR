/**
 * @file 地图交互 Hook
 * @desc 国家悬停/离开/mousemove事件管理，tooltip位置更新(200ms消失延迟)
 */
'use client'

import { useState, useCallback, useRef } from 'react'
import type { TooltipState } from '@/types/map'

export function useMapInteraction() {
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0, y: 0,
    countryId: null,
    countryName: '',
    cws: 0,
    alignment: '',
  })
  const tooltipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCountryHover = useCallback((
    countryId: string,
    countryName: string,
    cws: number,
    alignment: string,
    event: React.MouseEvent
  ) => {
    setHoveredCountryId(countryId)
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current)
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      countryId,
      countryName,
      cws,
      alignment,
    })
  }, [])

  const handleCountryLeave = useCallback(() => {
    setHoveredCountryId(null)
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltip(prev => ({ ...prev, visible: false }))
    }, 200)
  }, [])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    setTooltip(prev => prev.visible ? {
      ...prev,
      x: event.clientX,
      y: event.clientY,
    } : prev)
  }, [])

  return {
    hoveredCountryId,
    setHoveredCountryId,
    tooltip,
    handleCountryHover,
    handleCountryLeave,
    handleMouseMove,
  }
}
