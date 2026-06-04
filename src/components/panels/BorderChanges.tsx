/**
 * @file 边界变更日志
 * @desc 显示最近10条领土变更记录，6种类型(吞并/占领/放弃/统一/分裂/独立/条约)
 *       颜色编码：红/琥珀/绿/蓝/紫/翡翠/靛蓝
 */
'use client'

import { useMemo } from 'react'
import { useGameStore } from '@/store/gameStore'

export function BorderChanges() {
  const borderChangeLog = useGameStore(s => s.borderChangeLog)
  const countries = useGameStore(s => s.countries)

  const recentChanges = useMemo(() => {
    return [...borderChangeLog]
      .reverse()
      .slice(0, 10)
  }, [borderChangeLog])

  if (recentChanges.length === 0) return null

  const typeLabel: Record<string, string> = {
    ANNEX: '⚔ 吞并',
    OCCUPY: '📌 占领',
    RELEASE: '🕊 放弃',
    UNIFY: '🤝 统一',
    SPLIT: '✂ 分裂',
    DECOLONIZE: '🏳 独立',
    TREATY: '📜 条约',
  }

  const typeColor: Record<string, string> = {
    ANNEX: 'text-red-600',
    OCCUPY: 'text-amber-600',
    RELEASE: 'text-green-600',
    UNIFY: 'text-blue-600',
    SPLIT: 'text-purple-600',
    DECOLONIZE: 'text-emerald-600',
    TREATY: 'text-indigo-600',
  }

  return (
    <div className="border-t-2 border-stone-400/60">
      <div className="p-3 bg-stone-700/5 border-b border-stone-300/50">
        <h2 className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">
          🗺 边界变更
        </h2>
      </div>
      <div className="p-3 max-h-40 overflow-y-auto space-y-1.5">
        {recentChanges.map((change) => {
          const tl = typeLabel[change.type] ?? change.type
          const tc = typeColor[change.type] ?? 'text-stone-600'

          // Get display names from country data
          const fromName = change.fromOwner
            ? (countries[change.fromOwner]?.name ?? change.fromOwner)
            : '无'
          const toName = change.toOwner
            ? (countries[change.toOwner]?.name ?? change.toOwner)
            : '无'
          const featureName = countries[change.featureId]?.name ?? change.featureId

          return (
            <div key={change.id} className="text-[10px] leading-tight">
              <span className={`font-bold ${tc}`}>{tl}</span>{' '}
              <span className="text-stone-700">
                {featureName}
              </span>
              <span className="text-stone-400"> ({fromName} → {toName})</span>
              <div className="text-stone-400 italic ml-3">
                {change.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
