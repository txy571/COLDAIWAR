/**
 * @file 核心游戏类型定义
 * @desc 冷战大战略游戏的核心数据类型：Era/GamePhase/Country/PlayerState/GameState
 *       定义国家属性、玩家状态、派系阵营、行动系统等基础类型
 *       回合系统：4轮=1年，每轮美苏各行动1次，每人每年4次行动
 */

export type Era = 'POST_WW2' | 'IRON_CURTAIN' | 'INFO_AGE'
export type GamePhase = 'AI_EVENT' | 'USA_ACTION' | 'USSR_ACTION' | 'RESOLVE' // 4轮=1年，每人4次行动/年
export type Alignment = 'USA_ALLY' | 'USSR_ALLY' | 'NON_ALIGNED'
export type Side = 'usa' | 'ussr'
export type ActionCategory = 'ECONOMIC' | 'MILITARY' | 'POLITICAL' | 'DIPLOMATIC' | 'TECH'
export type ActionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED'
export type CwsStatus = 'DETENTE' | 'TENSE' | 'DANGEROUS' | 'CRITICAL' | 'BRINK'

// ===== Sub-Interfaces =====

export interface CountryEconomy {
  gdp: number
  industry: number
  resources: number
  budget: number
}

export interface CountryMilitary {
  army: number
  navy: number
  airforce: number
  nuclear: boolean
  nuclearArsenal: number
}

export interface CountrySociety {
  stability: number
  morale: number
  population: number
}

export interface CountryInfluence {
  usa: number
  ussr: number
}

export interface PlayerIntel {
  ussrPenetration: number
  cryptanalysis: boolean
}

// ===== Core Interfaces =====

export interface Country {
  id: string
  name: string
  region: string
  territoryPolygons: string[]
  coldWarScore: number
  economy: CountryEconomy
  military: CountryMilitary
  society: CountrySociety
  influence: CountryInfluence
  alignment: Alignment
  government: string
  isFlashpoint: boolean
}

export interface RegionalScore {
  region: string
  cws: number
  status: CwsStatus
  focusCountries: string[]
}

export interface PlayerState {
  side: Side
  leader: string
  actionPoints: number
  budget: number
  prestige: number
  publicSupport: number
  doomsdayClock: number
  intel: PlayerIntel
  researchPoints: number
  victoryScore: number
  recentActions: PlayerAction[]
}

export interface PlayerAction {
  id: string
  turn: number
  category: ActionCategory
  target: string
  description: string
  cost: number
  status: ActionStatus
}

export interface GameState {
  currentEra: Era
  year: number
  turn: number
  phase: GamePhase
  globalTension: number
  regionalScores: Record<string, RegionalScore>
  countries: Record<string, Country>
  players: {
    usa: PlayerState
    ussr: PlayerState
  }
  timeline: TimelineEvent[]
  newsFeed: NewsItem[]
  activeBuffs: Buff[]
  techTrees: {
    usa: TechNode[]
    ussr: TechNode[]
  }
}

// ===== Forward References (defined in tech.ts, events.ts) =====

import type { TechNode } from './tech'
import type { TimelineEvent, NewsItem } from './events'
import type { Buff } from './tech'

// ===== Helper Functions =====

export function deriveCwsStatus(cws: number): CwsStatus {
  if (cws >= 95) return 'BRINK'
  if (cws > 85) return 'CRITICAL'
  if (cws >= 60) return 'DANGEROUS'
  if (cws >= 30) return 'TENSE'
  return 'DETENTE'
}
