/**
 * @file 科技树面板
 * @desc 美苏独立研发(各63节点)，3类别过滤(军事/民生/社会)
 *       研发中/可研发/已完成三段展示，10研究点/次投入
 *       @todo 科技效果(TechNode.effects)应用未实现
 */
'use client'

import { useState, useMemo } from 'react'
import { useGameStore } from '@/store/gameStore'
import type { TechNode, TechCategory, Side } from '@/types'

const CATEGORIES: { id: TechCategory; label: string; icon: string }[] = [
  { id: 'MILITARY', label: '军事', icon: '⚔️' },
  { id: 'CIVILIAN', label: '民生', icon: '🏘' },
  { id: 'SOCIOLOGY', label: '社会', icon: '📚' },
]

export function TechTreePanel() {
  const [side, setSide] = useState<Side>('usa')
  const [filterCategory, setFilterCategory] = useState<TechCategory | null>(null)

  const year = useGameStore(s => s.year)
  const techTrees = useGameStore(s => s.techTrees)
  const researchTech = useGameStore(s => s.researchTech)
  const calculateResearchCost = useGameStore(s => s.calculateResearchCost)
  const modifyBudget = useGameStore(s => s.modifyBudget)
  const budget = useGameStore(s => s.players[side].budget)

  const tree = techTrees[side]

  const availableTechs = useMemo(() => {
    return tree.filter(n => {
      if (n.researched) return false
      if (filterCategory && n.category !== filterCategory) return false
      const prereqsMet = n.prerequisites.every(reqId => tree.find(t => t.id === reqId)?.researched)
      if (!prereqsMet) return false
      if (n.exclusiveTo && n.exclusiveTo !== 'SHARED' && n.exclusiveTo !== side) return false
      return true
    })
  }, [tree, filterCategory, side])

  const inProgressTechs = useMemo(() => {
    return tree.filter(n => !n.researched && (n.researchProgress ?? 0) > 0)
      .filter(n => {
        if (filterCategory && n.category !== filterCategory) return false
        return true
      })
  }, [tree, filterCategory])

  const researchedTechs = useMemo(() => {
    return tree.filter(n => n.researched)
      .filter(n => {
        if (filterCategory && n.category !== filterCategory) return false
        return true
      })
  }, [tree, filterCategory])

  const handleInvest = (nodeId: string) => {
    const node = tree.find(n => n.id === nodeId)
    if (!node || node.researched) return
    const cost = calculateResearchCost(node, year)
    if (cost === Infinity) return
    const investment = 10
    if (budget < investment) return
    modifyBudget(side, -investment)
    researchTech(side, nodeId, investment)
  }

  const renderNode = (node: TechNode) => {
    const cost = calculateResearchCost(node, year)
    const isLocked = cost === Infinity
    const progress = (node.researchProgress ?? 0) / node.cost

    return (
      <div key={node.id} className={`p-2 rounded-sm border text-[10px] ${
        node.researched
          ? 'bg-stone-200/50 border-stone-300/50 opacity-60'
          : isLocked
            ? 'bg-stone-200/30 border-stone-300/30 opacity-40'
            : 'bg-stone-100 border-stone-400 hover:border-stone-600 cursor-pointer'
      }`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-stone-700 text-[10px]">{node.name}</div>
            <div className="text-[8px] text-stone-500 font-mono">{node.id}</div>
          </div>
          <span className={`text-[8px] font-mono px-1 py-0.5 rounded ${
            node.era === 'ERA0_ATOMIC' ? 'bg-amber-900/20 text-amber-800' :
            node.era === 'ERA1_MISSILE' ? 'bg-orange-900/20 text-orange-800' :
            node.era === 'ERA2_SPACE' ? 'bg-blue-900/20 text-blue-800' :
            node.era === 'ERA3_COMPUTER' ? 'bg-purple-900/20 text-purple-800' :
            'bg-stone-300/50 text-stone-600'
          }`}>{node.era.replace('ERA', '').replace('_', ' ')}</span>
        </div>

        {!node.researched && !isLocked && (
          <>
            <div className="threat-meter mt-1.5">
              <div className="fill bg-stone-600" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="flex justify-between text-[8px] text-stone-500 mt-0.5 font-mono">
              <span>{node.researchProgress ?? 0}/{node.cost} RP</span>
              <span>Cost: {cost > 100 ? `${Math.round(cost)}` : cost}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleInvest(node.id) }}
              disabled={budget < 10}
              className="mt-1 w-full py-0.5 text-[8px] bg-stone-700 text-stone-200 rounded-sm hover:bg-stone-800 disabled:opacity-30 font-mono tracking-wider"
            >
              投入 10 研究点 (${budget >= 10 ? '✓' : '✗'})
            </button>
          </>
        )}

        {node.researched && (
          <div className="text-[8px] text-green-700 font-bold mt-1">✅ 已完成</div>
        )}

        {isLocked && (
          <div className="text-[8px] text-red-600 font-bold mt-1">🔒 需年份 {node.yearRequirement}</div>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 text-xs space-y-2">
      {/* Side toggle */}
      <div className="flex bg-stone-300/50 rounded-sm overflow-hidden border border-stone-400/60">
        <button
          className={`flex-1 py-1 text-[10px] font-bold font-mono tracking-wider transition-colors ${
            side === 'usa' ? 'bg-blue-900/30 text-blue-700 border-r border-stone-400/60' : 'text-stone-500'
          }`} onClick={() => setSide('usa')}
        >🇺🇸 美国</button>
        <button
          className={`flex-1 py-1 text-[10px] font-bold font-mono tracking-wider transition-colors ${
            side === 'ussr' ? 'bg-red-900/30 text-red-700' : 'text-stone-500'
          }`} onClick={() => setSide('ussr')}
        >🇷🇺 苏联</button>
      </div>

      {/* Category filter */}
      <div className="flex gap-1">
        <button
          className={`px-2 py-0.5 text-[9px] rounded-sm border font-mono tracking-wider ${
            !filterCategory ? 'bg-stone-700 text-stone-100 border-stone-700' : 'bg-stone-100 text-stone-500 border-stone-300'
          }`} onClick={() => setFilterCategory(null)}
        >全部</button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`px-2 py-0.5 text-[9px] rounded-sm border font-mono tracking-wider ${
              filterCategory === c.id ? 'bg-stone-700 text-stone-100 border-stone-700' : 'bg-stone-100 text-stone-500 border-stone-300'
            }`} onClick={() => setFilterCategory(c.id)}
          >{c.icon} {c.label}</button>
        ))}
      </div>

      {/* Budget */}
      <div className="text-[9px] text-stone-500 font-mono flex justify-between">
        <span>研发预算: <span className="font-bold text-stone-700">${budget}</span></span>
        <span>年份: <span className="font-bold">{year}</span></span>
      </div>

      {/* In Progress */}
      {inProgressTechs.length > 0 && (
        <div>
          <h3 className="text-[9px] text-amber-700 font-bold tracking-wider mb-1">研发中</h3>
          <div className="space-y-1">{inProgressTechs.map(renderNode)}</div>
        </div>
      )}

      {/* Available */}
      <div>
        <h3 className="text-[9px] text-stone-500 font-bold tracking-wider mb-1">
          可研发 ({availableTechs.length})
        </h3>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {availableTechs.length === 0
            ? <p className="text-[9px] text-stone-400 italic">无可用科技</p>
            : availableTechs.slice(0, 10).map(renderNode)
          }
        </div>
      </div>

      {/* Researched */}
      {researchedTechs.length > 0 && (
        <div>
          <h3 className="text-[9px] text-green-700 font-bold tracking-wider mb-1">
            已完成 ({researchedTechs.length})
          </h3>
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {researchedTechs.slice(-5).map(renderNode)}
          </div>
        </div>
      )}
    </div>
  )
}
