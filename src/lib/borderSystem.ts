/**
 * @file 边界系统工具函数
 * @desc GeoJSON要素级别领土视觉控制：有效所有权地图构建、渲染领土列表、
 *       扩张/丢失检测、视觉修饰(虚线圈占/斜线争议)、邻接检查
 */
import type { Country } from '@/types'
import type { TerritoryOverride, TerritoryStatus, BorderChangeRecord } from '@/types/map'
import geoData from '@/data/world.geo.json'

const allFeatures = (geoData as any).features as Array<{ properties: { id: string; name?: string } }>

/**
 * Get the display name of a GeoJSON feature (for logs and tooltips).
 */
export function getFeatureDisplayName(featureId: string): string {
  const feat = allFeatures.find((f) => f.properties.id === featureId)
  return feat?.properties?.name ?? featureId
}

/**
 * Build a map of featureId → countryId for the effective territory control.
 * Used by the map renderer to determine which color/style to use for each shape.
 */
export function buildEffectiveTerritoryMap(
  territoryOverrides: Record<string, string>
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const feat of allFeatures) {
    const fid = feat.properties.id
    map[fid] = territoryOverrides[fid] ?? fid
  }
  return map
}

/**
 * For a given country, get all GeoJSON feature IDs it should render as its territory,
 * including any it has taken via annexation/occupation.
 */
export function getRenderedTerritories(
  countryId: string,
  territoryOverrides: Record<string, string>
): string[] {
  const territories: string[] = [countryId]
  for (const [fid, owner] of Object.entries(territoryOverrides)) {
    if (owner === countryId && fid !== countryId) {
      territories.push(fid)
    }
  }
  return territories
}

/**
 * Check if a country currently owns more territory than its original borders.
 */
export function hasExpandedTerritory(
  countryId: string,
  territoryOverrides: Record<string, string>
): boolean {
  return Object.entries(territoryOverrides).some(
    ([fid, owner]) => owner === countryId && fid !== countryId
  )
}

/**
 * Check if a country has lost any of its original territory.
 */
export function hasLostTerritory(
  countryId: string,
  territoryOverrides: Record<string, string>
): boolean {
  return Object.entries(territoryOverrides).some(
    ([fid, owner]) => fid === countryId && owner !== countryId
  )
}

/**
 * Get the color/style modifier for a feature based on its territory status.
 * Returns visual overrides for the map renderer.
 */
export function getTerritoryVisualModifiers(
  featureId: string,
  defaultOwnerId: string,
  territoryOverrides: Record<string, string>
): {
  isTransferred: boolean
  transferredFrom: string | null
  strokeDash: string | null
  fillOpacityModifier: number
} {
  const effectiveOwner = territoryOverrides[featureId]

  // Feature is controlled by someone else
  if (effectiveOwner && effectiveOwner !== featureId) {
    return {
      isTransferred: true,
      transferredFrom: featureId,
      strokeDash: '6,3',
      fillOpacityModifier: 0.15,
    }
  }

  // Feature's original owner lost it
  const isLost = Object.entries(territoryOverrides).some(
    ([fid]) => fid === featureId
  )
  if (isLost) {
    return {
      isTransferred: false,
      transferredFrom: null,
      strokeDash: '4,4',
      fillOpacityModifier: -0.2,
    }
  }

  return {
    isTransferred: false,
    transferredFrom: null,
    strokeDash: null,
    fillOpacityModifier: 0,
  }
}

/**
 * Check if two countries share any border (for UI/mechanics purposes).
 * Currently checks if any controlled features are adjacent.
 * Simple implementation: check the territory override map.
 */
export function areCountriesAdjacent(
  countryA: string,
  countryB: string,
  territoryOverrides: Record<string, string>
): boolean {
  // For now, a simplified check: they share a border if
  // one controls a feature the other originally owned
  const overridesA = Object.entries(territoryOverrides)
    .filter(([_, owner]) => owner === countryA)
    .map(([fid]) => fid)

  const overridesB = Object.entries(territoryOverrides)
    .filter(([_, owner]) => owner === countryB)
    .map(([fid]) => fid)

  // Check if A's original feature is controlled by B or vice versa
  if (overridesA.includes(countryB) || overridesB.includes(countryA)) return true

  return false
}
