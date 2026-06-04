/**
 * @file 局势(事件)系统类型定义
 * @desc 7种局势类型(内战/危机/代理战争/革命/外交/独立/经济)，
 *       多阶段推进系统、结束条件、CWS影响机制
 */
export type SituationType =
  | 'CIVIL_WAR'     // 内战 (如中国)
  | 'CRISIS'        // 危机 (如柏林、古巴)
  | 'PROXY_WAR'     // 代理人战争 (如越南、阿富汗)
  | 'REVOLUTION'    // 革命/起义 (如匈牙利、布拉格)
  | 'DIPLOMATIC'    // 外交对抗
  | 'INDEPENDENCE'  // 独立/去殖民化
  | 'ECONOMIC'      // 经济危机

export type SituationStage = {
  name: string
  description: string
  durationTurns: number  // -1 = indefinite
  cwsModifier: number    // 该阶段对CWS的额外影响
  effects: SituationEffect[]
}

export type SituationEffect = {
  type: 'CWS_MODIFY' | 'TENSION_MODIFY' | 'BUFF_ADD' | 'DEBUFF_ADD' | 'TERRITORY_CHANGE'
  target?: string
  value: number
}

export type EndCondition = {
  type: 'TURNS_PASSED' | 'CWS_THRESHOLD' | 'PLAYER_ACTION' | 'AI_DECISION'
  value?: number  // turns or CWS threshold
}

export interface Situation {
  id: string
  name: string
  description: string
  type: SituationType
  startYear: number
  startTurn: number
  affectedCountries: string[]
  affectedRegion: string
  stages: SituationStage[]
  currentStage: number
  stageProgress: number  // turns in current stage
  endCondition: EndCondition
  isActive: boolean
  createdBy: 'AI' | 'PREDEFINED'

  // Runtime
  turnsActive: number
  cwsImpact: number  // current total CWS impact
}
