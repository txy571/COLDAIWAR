/**
 * @file Era II CRT雷达覆盖层
 * @desc 深绿色背景+扫描线+中心雷达发光+旋转扫描扇形动画
 *       包含 D3 geoGraticule 15° 经纬度网格线
 */
'use client'

import * as d3 from 'd3'
import { RadarSweep } from './RadarSweep'

interface CrtOverlayProps {
  width: number
  height: number
  pathGenerator: any
}

export function CrtOverlay({ width, height, pathGenerator }: CrtOverlayProps) {
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.max(width, height) * 0.7

  // Generate 15-degree interval geoGraticule path using D3
  const graticulePath = pathGenerator(d3.geoGraticule().step([15, 15])()) || ''

  return (
    <g className="crt-overlay">
      {/* Scanline pattern */}
      <defs>
        <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="2" fill="rgba(0,255,136,0.03)" />
          <rect y="2" width="4" height="2" fill="transparent" />
        </pattern>

        {/* Radar gradient */}
        <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.08" />
          <stop offset="70%" stopColor="#00ff88" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dark background */}
      <rect width={width} height={height} fill="#000a00" />

      {/* 15-degree GeoGraticule grid lines */}
      <path
        d={graticulePath}
        fill="none"
        stroke="rgba(0,255,136,0.07)"
        strokeWidth={0.5}
        pointerEvents="none"
      />

      {/* Scanlines overlay */}
      <rect width={width} height={height} fill="url(#scanlines)" pointerEvents="none" />

      {/* Center glow */}
      <circle cx={centerX} cy={centerY} r={radius} fill="url(#radar-glow)" pointerEvents="none" />

      {/* Radar sweep component */}
      <RadarSweep centerX={centerX} centerY={centerY} radius={radius} />

      {/* Center dot */}
      <circle cx={centerX} cy={centerY} r={2} fill="#00ff88" opacity={0.6} />
      <circle cx={centerX} cy={centerY} r={6} fill="none" stroke="#00ff88" strokeWidth={0.5} opacity={0.3} />
      <circle cx={centerX} cy={centerY} r={12} fill="none" stroke="#00ff88" strokeWidth={0.3} opacity={0.15} />
    </g>
  )
}
