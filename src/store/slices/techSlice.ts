/**
 * @file Tech Slice — 科技树管理
 * @desc 美苏独立科技树(各63节点)、研究投资、可用科技过滤、时代惩罚成本计算
 *       前置条件检查、独占分支过滤、跨时代成本惩罚(+50%/年)
 */
import type { StateCreator } from 'zustand'
import type { Side, TechNode } from '@/types'
import { INITIAL_TECH_TREE } from '@/data/techTree'

function cloneTechTree(): TechNode[] {
  return INITIAL_TECH_TREE.map(n => ({
    ...n,
    effects: n.effects.map(e => ({ ...e })),
    prerequisites: [...n.prerequisites],
    researched: false,
    researchProgress: 0,
  }))
}

export interface TechSlice {
  techTrees: { usa: TechNode[]; ussr: TechNode[] }
  researchTech: (side: Side, nodeId: string, investment: number) => void
  getAvailableTechs: (side: Side, currentYear: number) => TechNode[]
  calculateResearchCost: (node: TechNode, currentYear: number) => number
}

export const createTechSlice: StateCreator<TechSlice, [["zustand/immer", never], never], [], TechSlice> = (set, get) => ({
  techTrees: {
    usa: cloneTechTree(),
    ussr: cloneTechTree(),
  },

  researchTech: (side, nodeId, investment) => set((s) => {
    const tree = (s as any).techTrees[side] as TechNode[]
    const node = tree.find((n: TechNode) => n.id === nodeId)
    if (!node || node.researched) return
    node.researchProgress = (node.researchProgress ?? 0) + investment
    if (node.researchProgress >= node.cost) {
      node.researched = true
      node.researchProgress = node.cost
    }
  }),

  getAvailableTechs: (side, currentYear) => {
    const tree = (get() as any).techTrees[side] as TechNode[]
    return tree.filter((n: TechNode) => {
      if (n.researched) return false
      const allPrereqsMet = n.prerequisites.every((reqId: string) => tree.find((t: TechNode) => t.id === reqId)?.researched)
      if (!allPrereqsMet) return false
      if (n.exclusiveTo !== undefined && n.exclusiveTo !== 'SHARED' && n.exclusiveTo !== side) return false
      return true
    })
  },

  calculateResearchCost: (node, currentYear) => {
    const yearsAhead = node.yearRequirement - currentYear
    if (yearsAhead > 15) return Infinity
    if (yearsAhead <= 0) return node.cost
    return Math.round(node.cost * (1 + yearsAhead * 0.5))
  },
})
