/**
 * @file Zustand 全局状态管理入口
 * @desc 使用 immer 中间件的组合式 Store，聚合7个 Slice：
 *       Game/Country/Player/Tech/Event/Situation/Territory
 */
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createGameSlice } from './slices/gameSlice'
import type { GameSlice } from './slices/gameSlice'
import { createCountrySlice } from './slices/countrySlice'
import type { CountrySlice } from './slices/countrySlice'
import { createPlayerSlice } from './slices/playerSlice'
import type { PlayerSlice } from './slices/playerSlice'
import { createTechSlice } from './slices/techSlice'
import type { TechSlice } from './slices/techSlice'
import { createEventSlice } from './slices/eventSlice'
import type { EventSlice } from './slices/eventSlice'
import { createSituationSlice } from './slices/situationSlice'
import type { SituationSlice } from './slices/situationSlice'
import { createTerritorySlice } from './slices/territorySlice'
import type { TerritorySlice } from './slices/territorySlice'

export type GameStore = GameSlice &
  CountrySlice &
  PlayerSlice &
  TechSlice &
  EventSlice &
  SituationSlice &
  TerritorySlice

export const useGameStore = create<GameStore>()(
  immer((...args) => ({
    ...createGameSlice(...args),
    ...createCountrySlice(...args),
    ...createPlayerSlice(...args),
    ...createTechSlice(...args),
    ...createEventSlice(...args),
    ...createSituationSlice(...args),
    ...createTerritorySlice(...args),
  }))
)
