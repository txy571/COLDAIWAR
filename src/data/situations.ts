/**
 * @file 预定义历史局势
 * @desc 4个冷战标志性事件：中国内战(1945起)/柏林封锁(1948)/朝鲜战争(1950)/德国统一(1989)
 *       每个局势有多阶段推进、CWS影响、可选领土变更效果
 *       TODO: 需要更多局势(古巴导弹危机/匈牙利革命/布拉格之春/越南战争等)
 */
import type { Situation } from '@/types/situation'

/** Pre-defined historical situations */
export const PREDEFINED_SITUATIONS: Situation[] = [
  {
    id: 'chinese_civil_war',
    name: '中国内战',
    description: '国民党与共产党争夺中国统治权的全面内战。苏联支持中共，美国支持国民党。',
    type: 'CIVIL_WAR',
    startYear: 1945,
    startTurn: 1,
    affectedCountries: ['china'],
    affectedRegion: 'east_asia',
    stages: [
      { name: '停火谈判破裂', description: '国共全面内战爆发。', durationTurns: 8, cwsModifier: 5, effects: [] },
      { name: '中共转入反攻', description: '三大战役奠定胜局。', durationTurns: 8, cwsModifier: 8, effects: [] },
      {
        name: '国民党败退台湾',
        description: '中华人民共和国成立，国民党退守台湾。',
        durationTurns: 4,
        cwsModifier: 10,
        effects: [
          // Note: when a proper "taiwan" GeoJSON feature is added, this can transfer it
          // { type: 'TERRITORY_CHANGE', target: 'taiwan:china', value: 0 },
        ],
      },
    ],
    currentStage: 0, stageProgress: 0,
    endCondition: { type: 'TURNS_PASSED', value: 20 },
    isActive: true, createdBy: 'PREDEFINED', turnsActive: 0, cwsImpact: 5,
  },
  {
    id: 'berlin_blockade',
    name: '柏林封锁',
    description: '苏联封锁西柏林陆路通道，西方空运维持供给。',
    type: 'CRISIS',
    startYear: 1948, startTurn: 13,
    affectedCountries: ['west_germany', 'east_germany', 'uk', 'france'],
    affectedRegion: 'western_europe',
    stages: [
      { name: '封锁开始', description: '苏联切断西柏林陆路。', durationTurns: 4, cwsModifier: 10, effects: [] },
      { name: '空运持续', description: '柏林空运维持。', durationTurns: 8, cwsModifier: 8, effects: [] },
    ],
    currentStage: 0, stageProgress: 0,
    endCondition: { type: 'TURNS_PASSED', value: 12 },
    isActive: false, createdBy: 'PREDEFINED', turnsActive: 0, cwsImpact: 0,
  },
  {
    id: 'korean_war',
    name: '朝鲜战争',
    description: '朝鲜入侵韩国，联合国军介入，中国参战。第一场冷战热战。',
    type: 'PROXY_WAR',
    startYear: 1950, startTurn: 21,
    affectedCountries: ['south_korea', 'north_korea', 'china'],
    affectedRegion: 'east_asia',
    stages: [
      {
        name: '朝鲜进攻',
        description: '朝鲜人民军攻占汉城。',
        durationTurns: 4,
        cwsModifier: 15,
        effects: [
          // North Korea occupies South Korea's territory (if south_korea feature existed in GeoJSON)
          // { type: 'TERRITORY_CHANGE', target: 'south_korea:north_korea', value: 0 },
        ],
      },
      {
        name: '仁川登陆',
        description: '联合国军反攻，收复汉城。',
        durationTurns: 4,
        cwsModifier: 15,
        effects: [
          // { type: 'TERRITORY_CHANGE', target: 'south_korea:south_korea', value: 0 },
        ],
      },
      {
        name: '中国参战',
        description: '志愿军参战，形成僵持。',
        durationTurns: 12,
        cwsModifier: 12,
        effects: [],
      },
    ],
    currentStage: 0, stageProgress: 0,
    endCondition: { type: 'TURNS_PASSED', value: 20 },
    isActive: false, createdBy: 'PREDEFINED', turnsActive: 0, cwsImpact: 0,
  },
  {
    id: 'german_reunification',
    name: '德国统一',
    description: '东德并入西德，两德统一。冷战结束的象征。',
    type: 'DIPLOMATIC',
    startYear: 1989,
    startTurn: 1,
    affectedCountries: ['west_germany', 'east_germany'],
    affectedRegion: 'western_europe',
    stages: [
      {
        name: '柏林墙倒塌',
        description: '东德开放边境，柏林墙被推倒。',
        durationTurns: 4,
        cwsModifier: -10,
        effects: [],
      },
      {
        name: '统一条约',
        description: '两德正式统一，东德领土并入西德。',
        durationTurns: 2,
        cwsModifier: -15,
        effects: [
          // East Germany territory transfers to West Germany
          { type: 'TERRITORY_CHANGE', target: 'east_germany:west_germany', value: 0 },
        ],
      },
    ],
    currentStage: 0, stageProgress: 0,
    endCondition: { type: 'TURNS_PASSED', value: 6 },
    isActive: false,
    createdBy: 'PREDEFINED',
    turnsActive: 0,
    cwsImpact: 0,
  },
]
