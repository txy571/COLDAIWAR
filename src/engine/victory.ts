/**
 * @file 胜利条件检测引擎
 * @desc 5种胜利方式：
 *       1. 支配胜利 — 任意方500分
 *       2. 太空竞赛 — 先完成ICBM/通信卫星/侦察卫星
 *       3. 核威慑 — 200+核弹头，对手3倍，全球紧张度75+
 *       4. 意识形态 — 60%+国家归附
 *       5. 经济碾压 — GDP碾压对手至20以下
 *       generateEpilogue() 生成历史档案风格的战后总结
 */
import type { GameStore } from '@/store/gameStore'
import type { Side } from '@/types'

export interface VictoryResult {
  won: boolean
  winner: Side | null
  type: VictoryType | null
  description: string
  year: number
  turn: number
}

export type VictoryType =
  | 'DOMINATION'      // 500 分支配胜利
  | 'SPACE'           // 太空竞赛胜利
  | 'NUCLEAR'         // 核优势
  | 'IDEOLOGICAL'     // 意识形态胜利
  | 'ECONOMIC'        // 经济碾压

const VICTORY_SCORE_TARGET = 500

const SPACE_TECHS = ['icbm', 'comm_satellite', 'recon_satellite']

/**
 * Check all victory conditions (no forced end year)
 */
export function checkVictory(state: GameStore): VictoryResult {
  const { usa, ussr } = state.players
  const countries = state.countries
  const techTrees = state.techTrees

  // 1. Domination Victory
  if (usa.victoryScore >= VICTORY_SCORE_TARGET) {
    return { won: true, winner: 'usa', type: 'DOMINATION',
      description: `美国以 ${usa.victoryScore} 分锁定支配性胜利。自由民主体制在全球取得压倒性优势。`,
      year: state.year, turn: state.turn }
  }
  if (ussr.victoryScore >= VICTORY_SCORE_TARGET) {
    return { won: true, winner: 'ussr', type: 'DOMINATION',
      description: `苏联以 ${ussr.victoryScore} 分锁定支配性胜利。社会主义阵营在全球取得压倒性优势。`,
      year: state.year, turn: state.turn }
  }

  // 2. Space Victory
  const usaSpaceDone = SPACE_TECHS.every(id => techTrees.usa.find(t => t.id === id)?.researched)
  const ussrSpaceDone = SPACE_TECHS.every(id => techTrees.ussr.find(t => t.id === id)?.researched)
  if (usaSpaceDone && !ussrSpaceDone) {
    return { won: true, winner: 'usa', type: 'SPACE',
      description: `美国在太空竞赛中击败苏联！从阿波罗登月到航天飞机，星条旗插上了星辰大海。`,
      year: state.year, turn: state.turn }
  }
  if (ussrSpaceDone && !usaSpaceDone) {
    return { won: true, winner: 'ussr', type: 'SPACE',
      description: `苏联在太空竞赛中击败美国！从第一颗卫星到太空站，红色星辰照耀宇宙。`,
      year: state.year, turn: state.turn }
  }

  // 3. Nuclear Victory (200+ warheads, 3x opponent, high tension)
  const usaNukes = countries.usa?.military.nuclearArsenal ?? 0
  const ussrNukes = countries.ussr?.military.nuclearArsenal ?? 0
  if (usaNukes >= 200 && usaNukes >= ussrNukes * 3 && state.globalTension > 75) {
    return { won: true, winner: 'usa', type: 'NUCLEAR',
      description: `美国核武库达 ${usaNukes} 枚，对苏形成绝对核优势。华盛顿的核威慑最终迫使莫斯科让步。`,
      year: state.year, turn: state.turn }
  }
  if (ussrNukes >= 200 && ussrNukes >= usaNukes * 3 && state.globalTension > 75) {
    return { won: true, winner: 'ussr', type: 'NUCLEAR',
      description: `苏联核武库达 ${ussrNukes} 枚，对美形成绝对核优势。莫斯科的核威慑最终迫使华盛顿让步。`,
      year: state.year, turn: state.turn }
  }

  // 4. Ideological Victory (60%+ of countries aligned)
  const total = Object.keys(countries).length
  const usaAllies = Object.values(countries).filter(c => c.alignment === 'USA_ALLY').length
  const ussrAllies = Object.values(countries).filter(c => c.alignment === 'USSR_ALLY').length
  const needed = Math.ceil(total * 0.6)
  if (usaAllies >= needed) {
    return { won: true, winner: 'usa', type: 'IDEOLOGICAL',
      description: `${usaAllies}/${total} 国家加入西方阵营。民主自由的理念赢得了世界。`,
      year: state.year, turn: state.turn }
  }
  if (ussrAllies >= needed) {
    return { won: true, winner: 'ussr', type: 'IDEOLOGICAL',
      description: `${ussrAllies}/${total} 国家加入社会主义阵营。共产主义理想照亮了世界。`,
      year: state.year, turn: state.turn }
  }

  // 5. Economic Victory
  const usaGdp = countries.usa?.economy.gdp ?? 80
  const ussrGdp = countries.ussr?.economy.gdp ?? 60
  if (usaGdp >= 150 && ussrGdp <= 20) {
    return { won: true, winner: 'usa', type: 'ECONOMIC',
      description: `苏联经济崩溃（GDP仅剩${ussrGdp}）。美国以雄厚国力赢得经济战。`,
      year: state.year, turn: state.turn }
  }
  if (ussrGdp >= 120 && usaGdp <= 20) {
    return { won: true, winner: 'ussr', type: 'ECONOMIC',
      description: `美国经济崩溃。苏联计划经济展现出惊人韧性。`,
      year: state.year, turn: state.turn }
  }

  return { won: false, winner: null, type: null, description: '', year: state.year, turn: state.turn }
}

/**
 * Generate AI epilogue
 */
export function generateEpilogue(result: VictoryResult, state: GameStore): string {
  const winnerName = result.winner === 'usa' ? '美利坚合众国' : '苏维埃社会主义共和国联盟'
  const loserName = result.winner === 'usa' ? '苏联' : '美国'
  const typeLabels: Record<string, string> = {
    DOMINATION: '全球支配', SPACE: '太空竞赛', NUCLEAR: '核威慑', IDEOLOGICAL: '意识形态', ECONOMIC: '经济碾压',
  }
  const typeSummaries: Record<string, string> = {
    DOMINATION: '通过数十年的外交渗透、军事同盟与经济援助，最终建立了无可争议的全球霸权。',
    SPACE: '当胜利者的航天器划破天际，人类文明进入了新纪元。这不仅是技术的较量，更是两种制度的终极对决。',
    NUCLEAR: '在恐怖的平衡中，一方取得了压倒性优势。核威慑的阴影虽然笼罩世界，但胜利者证明了自己维护秩序的实力。',
    IDEOLOGICAL: '理念的力量改变了世界地图的颜色。胜利者的价值观成为全球效仿的榜样。',
    ECONOMIC: '经济基础的差异决定了上层建筑的命运。更可持续的发展道路最终胜出。',
  }

  return `===== 冷战终局 · 历史档案 =====

时间：${result.year}年（第${state.turn}回合）
胜利者：${winnerName}
胜利方式：${typeLabels[result.type ?? ''] ?? '未知'}

最终比分：美国 ${state.players.usa.victoryScore} 分 — 苏联 ${state.players.ussr.victoryScore} 分

${typeSummaries[result.type ?? ''] ?? ''}

${loserName}的挑战未能撼动${winnerName}的根基。和平降临了——以胜利者定义的方式。

—— 冷战 AI 历史记录员`
}
