/**
 * @file Situation Slice — 局势系统管理
 * @desc 局势激活/多阶段推进/结束条件检测/自动AI生成,
 *       阶段推进时触发领土变更、CWS修改等效果
 */
import type { StateCreator } from 'zustand'
import type { Situation, SituationType, SituationStage } from '@/types/situation'
import { PREDEFINED_SITUATIONS } from '@/data/situations'

export interface SituationSlice {
  activeSituations: Situation[]
  allSituations: Situation[]
  pastSituations: Situation[]

  activateSituation: (situation: Situation) => void
  advanceSituations: (currentTurn: number, currentYear: number) => void
  endSituation: (situationId: string) => void
  createAISituation: (
    name: string, description: string, type: SituationType,
    affectedCountries: string[], affectedRegion: string,
    stages: SituationStage[], turn: number, year: number
  ) => void
}

export const createSituationSlice: StateCreator<
  SituationSlice,
  [['zustand/immer', never], never],
  [],
  SituationSlice
> = (set, get) => ({
  activeSituations: PREDEFINED_SITUATIONS.filter(s => s.isActive),
  allSituations: [...PREDEFINED_SITUATIONS],
  pastSituations: [],

  activateSituation: (situation) => set((s) => {
    s.activeSituations.push(situation)
    s.allSituations.push(situation)
  }),

  advanceSituations: (currentTurn, currentYear) => set((s) => {
    for (let i = s.activeSituations.length - 1; i >= 0; i--) {
      const sit = s.activeSituations[i]
      sit.turnsActive += 1
      sit.stageProgress += 1

      // Check stage advancement
      const stage = sit.stages[sit.currentStage]
      if (stage && sit.stageProgress >= stage.durationTurns) {
        if (sit.currentStage < sit.stages.length - 1) {
          sit.currentStage += 1
          sit.stageProgress = 0
          sit.cwsImpact = sit.stages[sit.currentStage].cwsModifier

          // Apply stage-level effects (including TERRITORY_CHANGE)
          const newStage = sit.stages[sit.currentStage]
          if (newStage?.effects) {
            for (const effect of newStage.effects) {
              if (effect.type === 'TERRITORY_CHANGE' && effect.target) {
                // Territory change effect: target is "featureId:newOwnerId"
                const [featureId, newOwnerId] = effect.target.split(':')
                if (featureId && newOwnerId) {
                  // Cross-slice access: territoryOverrides belongs to TerritorySlice
                  const state = s as any
                  if (state.territoryOverrides !== undefined) {
                    state.territoryOverrides[featureId] = newOwnerId
                    state.borderChangeLog?.push({
                      id: `sit_${sit.id}_${sit.currentStage}`,
                      turn: currentTurn,
                      year: currentYear,
                      type: 'ANNEX',
                      featureId,
                      fromOwner: featureId,
                      toOwner: newOwnerId,
                      description: `${sit.name}: ${featureId} 归属变更为 ${newOwnerId}`,
                    })
                  }
                }
              }
            }
          }
        }
      }

      // Check end condition
      let shouldEnd = false
      switch (sit.endCondition.type) {
        case 'TURNS_PASSED':
          if (sit.turnsActive >= (sit.endCondition.value ?? 999)) shouldEnd = true
          break
        case 'AI_DECISION':
          // AI will handle this
          break
        default:
          break
      }

      if (
        shouldEnd ||
        (sit.currentStage >= sit.stages.length - 1 &&
          sit.stageProgress >= sit.stages[sit.stages.length - 1].durationTurns)
      ) {
        s.activeSituations.splice(i, 1)
        s.pastSituations.push(sit)
      }
    }
  }),

  endSituation: (situationId) => set((s) => {
    const idx = s.activeSituations.findIndex(sit => sit.id === situationId)
    if (idx !== -1) {
      const sit = s.activeSituations[idx]
      s.activeSituations.splice(idx, 1)
      s.pastSituations.push(sit)
    }
  }),

  createAISituation: (name, description, type, affectedCountries, affectedRegion, stages, turn, year) =>
    set((s) => {
      const newSituation: Situation = {
        id: `ai_situation_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name, description, type,
        startYear: year, startTurn: turn,
        affectedCountries, affectedRegion,
        stages,
        currentStage: 0, stageProgress: 0,
        endCondition: { type: 'AI_DECISION' },
        isActive: true,
        createdBy: 'AI',
        turnsActive: 0,
        cwsImpact: stages[0]?.cwsModifier ?? 0,
      }
      s.activeSituations.push(newSituation)
      s.allSituations.push(newSituation)
    }),
})
