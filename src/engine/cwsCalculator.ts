/**
 * @file CWS 冷战分计算引擎
 * @desc 冷战分(CWS)核心公式：CWS = 基准热度 + 影响力差×0.3 + 军事力量 + 事件加成
 *       区域CWS = 区域内国家平均 + 最高值×0.2
 *       全球紧张度 = 区域CWS平均 + 末日时钟×0.2
 *       5级阈值：缓和(0-29)/紧张(30-59)/高危(60-84)/临界(85-94)/核边缘(95-100)
 */
import type { Country, RegionalScore, CwsStatus } from '@/types'
import { deriveCwsStatus } from '@/types'

/**
 * Calculate a country's Cold War Score based on:
 * CWS = BASE + INFLUENCE_GAP + MILITARY + EVENT_BOOST
 */
export function calculateCountryCWS(
  country: Country,
  baseOverride?: number,
  eventBoost: number = 0
): number {
  const BASE = baseOverride ?? getBaseTension(country)
  const INFLUENCE_GAP = Math.min(Math.abs(country.influence.usa - country.influence.ussr) * 0.3, 30)
  const MILITARY = (country.military.army + country.military.navy + country.military.airforce) / 300 * 20
  const raw = BASE + INFLUENCE_GAP + MILITARY + eventBoost
  return Math.max(0, Math.min(100, Math.round(raw)))
}

/**
 * Calculate regional CWS as average + 20% of max
 */
export function calculateRegionalCWS(countries: Country[]): number {
  if (countries.length === 0) return 0
  const cwsValues = countries.map(c => c.coldWarScore)
  const avg = cwsValues.reduce((a, b) => a + b, 0) / cwsValues.length
  const max = Math.max(...cwsValues)
  return Math.max(0, Math.min(100, Math.round(avg + 0.2 * max)))
}

/**
 * Calculate global tension from regional scores and doomsday clock
 */
export function calculateGlobalTension(
  regionalScores: Record<string, RegionalScore>,
  doomsdayClock: number
): number {
  const scores = Object.values(regionalScores)
  if (scores.length === 0) return 0
  const avgRegional = scores.reduce((a, b) => a + b.cws, 0) / scores.length
  const raw = avgRegional + doomsdayClock * 0.2
  return Math.max(0, Math.min(100, Math.round(raw)))
}

/**
 * Get the base tension level for a country based on its region and alignment
 */
function getBaseTension(country: Country): number {
  const regionBase: Record<string, number> = {
    eastern_europe: 15,
    western_europe: 8,
    east_asia: 12,
    southeast_asia: 10,
    middle_east: 10,
    latin_america: 5,
    africa: 3,
    south_asia: 5,
    oceania: 2,
    north_america: 2,
  }
  return regionBase[country.region] ?? 5
}

/**
 * Check CWS threshold and return status
 */
export function checkCWSThreshold(cws: number): CwsStatus {
  return deriveCwsStatus(cws)
}

/**
 * Get the threshold table for UI display
 */
export function getCwsThresholdTable() {
  return [
    { status: 'DETENTE' as CwsStatus, min: 0, max: 29, description: '缓和', crisisChance: '5%' },
    { status: 'TENSE' as CwsStatus, min: 30, max: 59, description: '紧张', crisisChance: '20%' },
    { status: 'DANGEROUS' as CwsStatus, min: 60, max: 84, description: '高危', crisisChance: '35%' },
    { status: 'CRITICAL' as CwsStatus, min: 85, max: 94, description: '临界', crisisChance: '55%' },
    { status: 'BRINK' as CwsStatus, min: 95, max: 100, description: '核边缘', crisisChance: '80%' },
  ]
}
