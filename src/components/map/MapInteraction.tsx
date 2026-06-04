/**
 * @file 地图交互层
 * @desc SVG foreignObject 悬浮提示窗，显示国家名/CWS/阵营
 */
'use client'

import type { TooltipState } from '@/types/map'

interface MapInteractionProps {
  tooltip: TooltipState
}

export function MapInteraction({ tooltip }: MapInteractionProps) {
  return (
    <g className="map-interaction">
      {tooltip.visible && (
        <foreignObject
          x={Math.min(tooltip.x + 12, window.innerWidth - 200)}
          y={Math.min(tooltip.y - 10, window.innerHeight - 120)}
          width={180}
          height={90}
        >
          <div
            style={{
              background: '#d4c5a9',
              border: '1px solid #5a4a3a',
              borderRadius: 4,
              padding: '6px 10px',
              fontFamily: "'Courier Prime', monospace",
              fontSize: 12,
              color: '#5a4a3a',
              boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {tooltip.countryName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span>CWS:</span>
              <span style={{ fontWeight: 'bold', color: tooltip.cws > 60 ? '#8b0000' : '#5a4a3a' }}>
                {tooltip.cws}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>阵营:</span>
              <span>{tooltip.alignment}</span>
            </div>
          </div>
        </foreignObject>
      )}
    </g>
  )
}
