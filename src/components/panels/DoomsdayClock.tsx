/**
 * @file 末日时钟仪表盘
 * @desc SVG时钟(1-100映射到-120°~+120°)，6级状态(和平→核战争边缘)
 *       同时显示全球紧张度
 */
'use client'

import { useGameStore } from '@/store/gameStore'

export function DoomsdayClock() {
  const doomsdayClock = useGameStore(s => s.players.usa.doomsdayClock)
  const globalTension = useGameStore(s => s.globalTension)

  // Map doomsdayClock (1-100) to rotation (-120 to +120 degrees)
  const rotation = -120 + (doomsdayClock / 100) * 240

  const getLevel = () => {
    if (doomsdayClock >= 95) return { label: '核战争边缘', color: '#dc2626', text: 'text-red-600' }
    if (doomsdayClock >= 85) return { label: '极度危险', color: '#dc2626', text: 'text-red-600' }
    if (doomsdayClock >= 70) return { label: '高度紧张', color: '#ea580c', text: 'text-orange-600' }
    if (doomsdayClock >= 50) return { label: '局势紧张', color: '#ca8a04', text: 'text-amber-600' }
    if (doomsdayClock >= 30) return { label: '相对缓和', color: '#65a30d', text: 'text-green-600' }
    return { label: '和平时期', color: '#16a34a', text: 'text-green-600' }
  }

  const level = getLevel()

  return (
    <div className="p-3 border-b-2 border-stone-400/60">
      <h2 className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em] mb-2">☢ 末日时钟</h2>
      <div className="flex items-center gap-3">
        {/* Clock face */}
        <div className="relative w-16 h-16 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Background */}
            <circle cx="50" cy="50" r="45" fill="#292524" stroke="#57534e" strokeWidth="2" />
            {/* Danger arc */}
            <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#dc2626" strokeWidth="6" strokeOpacity="0.3" />
            {/* Safe arc */}
            <path d="M 85 50 A 35 35 0 0 1 15 50" fill="none" stroke="#22c55e" strokeWidth="6" strokeOpacity="0.15" />
            {/* Tick marks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
              <line
                key={deg}
                x1={50 + 40 * Math.cos((deg - 90) * Math.PI / 180)}
                y1={50 + 40 * Math.sin((deg - 90) * Math.PI / 180)}
                x2={50 + 43 * Math.cos((deg - 90) * Math.PI / 180)}
                y2={50 + 43 * Math.sin((deg - 90) * Math.PI / 180)}
                stroke="#78716c" strokeWidth="1"
              />
            ))}
            {/* Hand */}
            <line
              x1="50" y1="50"
              x2={50 + 28 * Math.cos((rotation - 90) * Math.PI / 180)}
              y2={50 + 28 * Math.sin((rotation - 90) * Math.PI / 180)}
              stroke={level.color} strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="50" cy="50" r="3" fill={level.color} />
          </svg>
        </div>

        {/* Text info */}
        <div className="text-[10px]">
          <div className={`font-bold ${level.text}`}>{level.label}</div>
          <div className="text-stone-500 font-mono mt-0.5">
            紧张度: {globalTension}%
          </div>
          <div className="text-stone-500 font-mono">
            时钟: {doomsdayClock}/100
          </div>
        </div>
      </div>
    </div>
  )
}
