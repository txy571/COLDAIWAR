/**
 * @file 地图与领土系统类型定义
 * @desc 视口状态、Tooltip、领土覆盖(吞并/争议/占领)、边界变更记录
 */
export interface ViewportState {
  width: number
  height: number
  scale: number
  centerLon: number
  centerLat: number
}

export interface TooltipState {
  visible: boolean
  x: number
  y: number
  countryId: string | null
  countryName: string
  cws: number
  alignment: string
}

export interface GeoFeatureProperties {
  id: string
  name: string
}

// ===== Territory / Border System =====

/** Status of a territory claim */
export type TerritoryStatus = 'CONTROLLED' | 'DISPUTED' | 'OCCUPIED' | 'CLAIMED'

/** A single feature-level territory override */
export interface TerritoryOverride {
  featureId: string
  ownerId: string       // Country ID that currently controls this feature
  status: TerritoryStatus
  sinceTurn: number
}

/** Record of a border change event */
export interface BorderChangeRecord {
  id: string
  turn: number
  year: number
  type: 'ANNEX' | 'OCCUPY' | 'RELEASE' | 'UNIFY' | 'SPLIT' | 'DECOLONIZE' | 'TREATY'
  featureId: string
  fromOwner: string | null
  toOwner: string | null
  description: string
}

/** Visual rendering mode for a territory */
export type BorderRenderMode = 'normal' | 'disputed_hatch' | 'occupied_dash' | 'transfer_flash'
