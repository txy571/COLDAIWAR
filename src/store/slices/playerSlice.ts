/**
 * @file Player Slice — 玩家状态管理
 * @desc 美苏玩家数据：预算/威望/公众支持/末日时钟/行动点/科技点/胜利分数
 *       末日时钟同时影响双方，每轮每人1次行动(每年4次)
 */
import type { StateCreator } from 'zustand'
import type { Side, PlayerState, PlayerAction, ActionStatus } from '@/types'

function createDefaultPlayerState(side: Side): PlayerState {
  return {
    side,
    leader: side === 'usa' ? 'Harry S. Truman' : 'Joseph Stalin',
    actionPoints: 1, // 每轮每人1次行动，每年4次
    budget: side === 'usa' ? 100 : 95,
    prestige: side === 'usa' ? 100 : 110,
    publicSupport: side === 'usa' ? 80 : 88,
    doomsdayClock: 20,
    intel: { ussrPenetration: 5, cryptanalysis: false },
    researchPoints: 0,
    victoryScore: 0,
    recentActions: [],
  }
}

export interface PlayerSlice {
  players: { usa: PlayerState; ussr: PlayerState }
  spendActionPoints: (side: Side, cost: number) => boolean
  modifyBudget: (side: Side, delta: number) => void
  modifyPrestige: (side: Side, delta: number) => void
  modifyPublicSupport: (side: Side, delta: number) => void
  modifyDoomsdayClock: (delta: number) => void
  addPlayerAction: (side: Side, action: PlayerAction) => void
  resolvePlayerAction: (side: Side, actionId: string, status: ActionStatus) => void
  refreshActionPoints: () => void
  addResearchPoints: (side: Side, amount: number) => void
  spendResearchPoints: (side: Side, amount: number) => boolean
  generateResearchPoints: (usaGdp: number, ussrGdp: number) => void
  addVictoryScore: (side: Side, amount: number) => void
  setLeader: (side: Side, leader: string) => void
}

export const createPlayerSlice: StateCreator<PlayerSlice, [["zustand/immer", never], never], [], PlayerSlice> = (set, get) => ({
  players: {
    usa: createDefaultPlayerState('usa'),
    ussr: createDefaultPlayerState('ussr'),
  },

  spendActionPoints: (side, cost) => {
    const player = get().players[side]
    if (player.actionPoints < cost) return false
    set((s) => { s.players[side].actionPoints -= cost })
    return true
  },

  modifyBudget: (side, delta) => set((s) => {
    s.players[side].budget = Math.max(0, s.players[side].budget + delta)
  }),

  modifyPrestige: (side, delta) => set((s) => {
    s.players[side].prestige = Math.max(0, Math.min(100, s.players[side].prestige + delta))
  }),

  modifyPublicSupport: (side, delta) => set((s) => {
    s.players[side].publicSupport = Math.max(0, Math.min(100, s.players[side].publicSupport + delta))
  }),

  modifyDoomsdayClock: (delta) => set((s) => {
    const val = Math.max(1, Math.min(100, s.players.usa.doomsdayClock + delta))
    s.players.usa.doomsdayClock = val
    s.players.ussr.doomsdayClock = val
    // Cross-slice access (globalTension is in GameSlice)
    ;(s as any).globalTension = Math.max(0, Math.min(100, ((s as any).globalTension ?? 0) + Math.floor(delta * 0.5)))
  }),

  addPlayerAction: (side, action) => set((s) => {
    s.players[side].recentActions.push(action)
    if (s.players[side].recentActions.length > 20) {
      s.players[side].recentActions = s.players[side].recentActions.slice(-20)
    }
  }),

  resolvePlayerAction: (side, actionId, status) => set((s) => {
    const action = s.players[side].recentActions.find((a: PlayerAction) => a.id === actionId)
    if (action) action.status = status
  }),

  refreshActionPoints: () => set((s) => {
    s.players.usa.actionPoints = 1
    s.players.ussr.actionPoints = 1
  }),

  setLeader: (side, leader) => set((s) => { s.players[side].leader = leader }),

  addResearchPoints: (side, amount) => set((s) => {
    s.players[side].researchPoints += amount
  }),

  spendResearchPoints: (side, amount) => {
    const player = get().players[side]
    if (player.researchPoints < amount) return false
    set((s) => { s.players[side].researchPoints -= amount })
    return true
  },

  generateResearchPoints: (usaGdp, ussrGdp) => set((s) => {
    // Research points = GDP/10 + industry/20 per turn
    s.players.usa.researchPoints += Math.max(2, Math.floor(usaGdp / 10))
    // USSR gets a bonus to compensate for lower GDP
    s.players.ussr.researchPoints += Math.max(2, Math.floor(ussrGdp / 8))
  }),

  addVictoryScore: (side, amount) => set((s) => {
    s.players[side].victoryScore += amount
  }),
})
