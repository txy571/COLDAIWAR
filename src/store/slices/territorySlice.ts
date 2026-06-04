/**
 * @file Territory Slice — 领土/边界变更系统
 * @desc GeoJSON要素级领土所有权管理：转移/释放/争议/解析/查询
 *       维护边界变更操作日志，支持吞并/占领/统一/分裂等类型
 */
import type { StateCreator } from 'zustand'
import type { TerritoryOverride, TerritoryStatus, BorderChangeRecord } from '@/types/map'

export interface TerritorySlice {
  /** featureId → current owner country ID. Empty = default (feature ID = country ID) */
  territoryOverrides: Record<string, string>
  /** History log of border changes */
  borderChangeLog: BorderChangeRecord[]

  /**
   * Transfer ownership of a GeoJSON feature to another country.
   * Returns the change record ID.
   */
  transferTerritory: (
    featureId: string,
    toOwnerId: string,
    type: BorderChangeRecord['type'],
    description: string,
    turn: number,
    year: number,
  ) => string | null

  /**
   * Release a territory back to its default owner (no override).
   */
  releaseTerritory: (featureId: string, turn: number, year: number) => void

  /**
   * Set a territory as disputed between two countries.
   * The feature remains visually under current owner but marked as disputed.
   */
  setDisputed: (featureId: string, ownerId: string, turn: number) => void

  /**
   * Resolve a dispute — confirm the owner.
   */
  resolveDispute: (featureId: string, turn: number, year: number) => void

  /**
   * Get the effective owner of a GeoJSON feature.
   * Falls back to featureId as countryId if no override.
   */
  getEffectiveOwner: (featureId: string) => string

  /**
   * Get all feature IDs currently controlled by a given country (including overrides).
   */
  getControlledFeatures: (countryId: string) => string[]

  /**
   * Get the current status of a feature (controlled/disputed/etc).
   */
  getFeatureStatus: (featureId: string) => TerritoryStatus

  /**
   * Clear all overrides (e.g. when starting a new game).
   */
  resetTerritories: () => void
}

let _changeCounter = 0

export const createTerritorySlice: StateCreator<
  TerritorySlice,
  [['zustand/immer', never], never],
  [],
  TerritorySlice
> = (set, get) => ({
  territoryOverrides: {},
  borderChangeLog: [],

  transferTerritory: (featureId, toOwnerId, type, description, turn, year) => {
    const state = get()
    const fromOwner = state.getEffectiveOwner(featureId)
    if (fromOwner === toOwnerId) return null

    const recordId = `border_${turn}_${++_changeCounter}`
    const record: BorderChangeRecord = {
      id: recordId,
      turn,
      year,
      type,
      featureId,
      fromOwner,
      toOwner: toOwnerId,
      description,
    }

    set((s) => {
      s.territoryOverrides[featureId] = toOwnerId
      s.borderChangeLog.push(record)
    })

    return recordId
  },

  releaseTerritory: (featureId, turn, year) => {
    const state = get()
    const currentOwner = state.getEffectiveOwner(featureId)
    const defaultOwner = featureId // default = feature ID = country ID
    if (currentOwner === defaultOwner) return

    set((s) => {
      delete s.territoryOverrides[featureId]
      s.borderChangeLog.push({
        id: `border_${turn}_${++_changeCounter}`,
        turn,
        year,
        type: 'RELEASE',
        featureId,
        fromOwner: currentOwner,
        toOwner: defaultOwner,
        description: `${currentOwner} 放弃了对 ${featureId} 的控制权`,
      })
    })
  },

  setDisputed: (featureId, ownerId, turn) => {
    const state = get()
    if (state.getEffectiveOwner(featureId) !== ownerId) {
      // Only dispute if the specified owner actually controls it
      return
    }
    // Currently overrides don't store status directly — we extend the system
    // by adding a convention: if owner === featureId default, it's controlled.
    // Disputed territories get an entry even if owner = default.
    set((s) => {
      // Ensure it's in the override map to mark as disputed
      // We'll use a sentinel in the future if needed
      if (!s.territoryOverrides[featureId]) {
        s.territoryOverrides[featureId] = ownerId
      }
    })
  },

  resolveDispute: (featureId, turn, year) => {
    const state = get()
    const currentOwner = state.getEffectiveOwner(featureId)
    // If the override exists but just resolves to default, clean it up
    if (currentOwner === featureId) {
      set((s) => {
        delete s.territoryOverrides[featureId]
      })
    }
  },

  getEffectiveOwner: (featureId) => {
    return get().territoryOverrides[featureId] ?? featureId
  },

  getControlledFeatures: (countryId) => {
    const state = get()
    const results: string[] = [countryId] // default: own feature

    for (const [fid, owner] of Object.entries(state.territoryOverrides)) {
      if (owner === countryId && fid !== countryId) {
        results.push(fid)
      }
    }

    return results
  },

  getFeatureStatus: (featureId) => {
    const state = get()
    if (state.territoryOverrides[featureId]) {
      const owner = state.territoryOverrides[featureId]
      if (owner !== featureId) {
        // Feature was transferred to a different owner
        return 'OCCUPIED'
      }
      // Feature overridden to self — could be disputed
      // For now, treat as controlled
      return 'CONTROLLED'
    }
    return 'CONTROLLED'
  },

  resetTerritories: () =>
    set((s) => {
      s.territoryOverrides = {}
      s.borderChangeLog = []
    }),
})
