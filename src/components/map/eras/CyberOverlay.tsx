/**
 * @file Era III 赛博全息覆盖层
 * @desc 深制造背景+数据网格+六边形网格+粒子动画
 */
'use client'

import { HexGrid } from './HexGrid'

interface CyberOverlayProps {
  width: number
  height: number
}

export function CyberOverlay({ width, height }: CyberOverlayProps) {
  return (
    <g className="cyber-overlay">
      <defs>
        <linearGradient id="cyber-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0a0015" />
          <stop offset="50%" stopColor="#050010" />
          <stop offset="100%" stopColor="#0a0015" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="url(#cyber-bg)" />

      {/* Data grid lines */}
      <g opacity={0.06} stroke="#00ffff" strokeWidth={0.5} fill="none">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * (height / 20)} x2={width} y2={i * (height / 20)} />
        ))}
        {Array.from({ length: 30 }).map((_, i) => (
          <line key={`v${i}`} x1={i * (width / 30)} y1={0} x2={i * (width / 30)} y2={height} />
        ))}
      </g>

      {/* Hex Grid Component */}
      <HexGrid width={width} height={height} />

      {/* Floating data particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <g key={i}>
          <circle
            cx={Math.random() * width}
            cy={Math.random() * height}
            r={1}
            fill={i % 3 === 0 ? '#00ffff' : '#ff00ff'}
            opacity={0.3 + Math.random() * 0.4}
          >
            <animate
              attributeName="opacity" values="0.2;0.8;0.2" dur={`${2 + Math.random() * 3}s`}
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ))}
    </g>
  )
}
