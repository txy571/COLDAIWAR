/**
 * @file 时代管理引擎
 * @desc 年份→时代映射：POST_WW2(1945-59)/IRON_CURTAIN(1960-79)/INFO_AGE(1980+)
 *       科技时代7级划分(ERA0原子→ERA6智能)，时代转换检测，中文名称
 */
import type { Era, TechEra } from '@/types'
import { ERA_VISUAL_MAP } from '@/types'

/**
 * Get the visual era for a given year
 * POST_WW2: 1945-1959
 * IRON_CURTAIN: 1960-1979
 * INFO_AGE: 1980+
 */
export function getEraForYear(year: number): Era {
  if (year >= 1980) return 'INFO_AGE'
  if (year >= 1960) return 'IRON_CURTAIN'
  return 'POST_WW2'
}

/**
 * Get the tech era for a given year
 */
export function getTechEraForYear(year: number): TechEra {
  if (year >= 2006) return 'ERA6_INTELLIGENCE'
  if (year >= 1990) return 'ERA5_POST_COLD'
  if (year >= 1980) return 'ERA4_INFORMATION'
  if (year >= 1970) return 'ERA3_COMPUTER'
  if (year >= 1960) return 'ERA2_SPACE'
  if (year >= 1950) return 'ERA1_MISSILE'
  return 'ERA0_ATOMIC'
}

/**
 * Get the visual era corresponding to a tech era
 */
export function getVisualEraForTechEra(techEra: TechEra): Era {
  return ERA_VISUAL_MAP[techEra]
}

/**
 * Check if an era transition occurs at this year
 * Returns the new era if transition happens, null if staying
 */
export function checkEraTransition(year: number): Era | null {
  const era = getEraForYear(year)
  const prevYearEra = getEraForYear(year - 1)
  return era !== prevYearEra ? era : null
}

/**
 * Get the era display name in Chinese
 */
export function getEraDisplayName(era: Era): string {
  const names: Record<Era, string> = {
    POST_WW2: '余烬时代 (1945-1959)',
    IRON_CURTAIN: '铁幕时代 (1960-1979)',
    INFO_AGE: '信息时代 (1980+)',
  }
  return names[era]
}
