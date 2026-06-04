/**
 * @file 科技树类型定义
 * @desc 科技节点/效果/Buff系统，7时代划分(ERA0-ERA6)，6大科技分支
 *       含美苏独占科技、时代锁定、前置依赖等机制
 */
import type { Era } from './game'

export type TechEra =
  | 'ERA0_ATOMIC'
  | 'ERA1_MISSILE'
  | 'ERA2_SPACE'
  | 'ERA3_COMPUTER'
  | 'ERA4_INFORMATION'
  | 'ERA5_POST_COLD'
  | 'ERA6_INTELLIGENCE'

export type TechCategory = 'MILITARY' | 'CIVILIAN' | 'SOCIOLOGY'
export type TechBranch = 'NUCLEAR' | 'AEROSPACE' | 'ELECTRONICS' | 'INDUSTRY' | 'COMPUTING' | 'WEAPONS'

// ===== Tech System Interfaces =====

export interface TechEffect {
  target: string
  modifier: 'add' | 'multiply' | 'set'
  value: number
}

export interface TechNode {
  id: string
  name: string
  description: string
  era: TechEra
  yearRequirement: number
  cost: number
  prerequisites: string[]
  exclusiveTo?: 'usa' | 'ussr' | 'SHARED'
  category: TechCategory
  effects: TechEffect[]
  branch: TechBranch

  // Runtime state (not serialized)
  researched?: boolean
  researchProgress?: number
}

export interface Buff {
  id: string
  name: string
  description: string
  targetCountry?: string
  targetRegion?: string
  effect: TechEffect
  duration: number
  remainingTurns: number
}

// ===== Visual Mapping =====

export const ERA_VISUAL_MAP: Record<TechEra, Era> = {
  ERA0_ATOMIC: 'POST_WW2',
  ERA1_MISSILE: 'POST_WW2',
  ERA2_SPACE: 'IRON_CURTAIN',
  ERA3_COMPUTER: 'IRON_CURTAIN',
  ERA4_INFORMATION: 'INFO_AGE',
  ERA5_POST_COLD: 'INFO_AGE',
  ERA6_INTELLIGENCE: 'INFO_AGE',
}
