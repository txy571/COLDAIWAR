/**
 * @file 初始区域冷战分(CWS)数据
 * @desc 10个地缘政治区域的初始CWS，东欧(45)/东亚(40)/中东(35)最高
 *       焦点国家标记各区域的战略热点
 */
import type { RegionalScore } from '@/types'
import { deriveCwsStatus } from '@/types'

export interface InitialRegionalScore {
  region: string
  cws: number
  focusCountries: string[]
}

export const INITIAL_REGIONAL_SCORES: Record<string, InitialRegionalScore> = {
  eastern_europe: { region: 'eastern_europe', cws: 45, focusCountries: ['east_germany'] },
  western_europe: { region: 'western_europe', cws: 20, focusCountries: ['west_germany'] },
  east_asia: { region: 'east_asia', cws: 40, focusCountries: ['north_korea', 'vietnam'] },
  southeast_asia: { region: 'southeast_asia', cws: 30, focusCountries: ['vietnam'] },
  middle_east: { region: 'middle_east', cws: 35, focusCountries: ['iran'] },
  latin_america: { region: 'latin_america', cws: 15, focusCountries: ['cuba'] },
  africa: { region: 'africa', cws: 10, focusCountries: [] },
  south_asia: { region: 'south_asia', cws: 10, focusCountries: [] },
  oceania: { region: 'oceania', cws: 5, focusCountries: [] },
  north_america: { region: 'north_america', cws: 5, focusCountries: [] },
}

export function createRegionalScoresFromInitial(): Record<string, RegionalScore> {
  const result: Record<string, RegionalScore> = {}
  for (const [key, val] of Object.entries(INITIAL_REGIONAL_SCORES)) {
    result[key] = {
      region: val.region,
      cws: val.cws,
      status: deriveCwsStatus(val.cws),
      focusCountries: [...val.focusCountries],
    }
  }
  return result
}
