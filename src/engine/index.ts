/** @file 引擎层统一导出：CWS计算/时代管理/回合循环/AI裁判/胜利检测 */
export {
  calculateCountryCWS,
  calculateRegionalCWS,
  calculateGlobalTension,
  checkCWSThreshold,
  getCwsThresholdTable,
} from './cwsCalculator'

export {
  getEraForYear,
  getTechEraForYear,
  getVisualEraForTechEra,
  checkEraTransition,
  getEraDisplayName,
} from './eraManager'

export {
  executeAIPhase,
  executeIntelPhase,
  executeResolutionPhase,
} from './turnLoop'
