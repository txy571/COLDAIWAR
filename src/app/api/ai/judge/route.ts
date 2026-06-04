import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, gameState, apiKey, provider, activePlayerSide } = body

    if (!apiKey) {
      return NextResponse.json({
        error: 'No API key configured',
        useRuleEngine: true,
      }, { status: 400 })
    }

    // --- Layer 2: Era Context & Information Asymmetry ---
    const side = activePlayerSide || 'usa'
    const playerState = side === 'usa' ? gameState?.players?.usa : gameState?.players?.ussr
    const opponentState = side === 'usa' ? gameState?.players?.ussr : gameState?.players?.usa
    const penetration = playerState?.intel?.ussrPenetration ?? 50

    // Filter country data based on intelligence level (Information Asymmetry)
    const filteredCountries: Record<string, any> = {}
    if (gameState?.countries) {
      for (const [cid, country] of Object.entries(gameState.countries) as [string, any][]) {
        // If penetration is low (< 30), obscure details of opponent-aligned countries
        const opponentSide = side === 'usa' ? 'USSR_ALLY' : 'USA_ALLY'
        if (penetration < 30 && country.alignment === opponentSide) {
          filteredCountries[cid] = {
            id: country.id,
            name: country.name,
            region: country.region,
            alignment: country.alignment,
            // Obscure exact values
            coldWarScore: '???',
            influence: { usa: '???', ussr: '???' },
            government: '???',
          }
        } else {
          filteredCountries[cid] = country
        }
      }
    }

    const systemPrompt = `你是一个冷战大战略回合制游戏的 AI 裁判（Game Master）。你的职责是根据玩家提交的行动进行游戏结算，并生成叙事和事件。

### 【Layer 1 — 硬规则 (17条不可逾越)】
1. **行动类别匹配**：严格校验玩家提交的行动描述是否与指定的类别（ECONOMIC, MILITARY, POLITICAL, DIPLOMATIC, TECH）相符。不相符则必须驳回。
2. **行动上限**：每回合每方仅允许执行 1 条行动指令。
3. **时代锁定**：如果行动涉及的技术研发或事件，与当前年份要求相比提前 > 15年（例如在1945年研究1960年后的太空技术），必须直接驳回。
4. **历史角色约束**：美苏双方不能违背其根本意识形态立场（例如美国直接实行计划经济或苏联建立资本主义联邦），若发生需予以驳回或重大惩罚。
5. **历史颠覆门槛**：涉及地缘政治方向的重大变更（如国家阵营偏向变更、合并或分裂），必须在 outcome 中描述为多回合行动积累的结果，单次行动不能直接彻底颠覆。
6. **CWS 阈值强制触发**：若有任意国家的冷战分（CWS）大于 85，必须在此回合的 newEvent 中触发相关的历史性危机事件。
7. **CWS 变更幅度限制**：单次结算对单个国家 CWS 调整绝对值不能超过 15。
8. **核武器使用门槛**：只有当全球紧张度（globalTension）或国家 CWS 大于 95 且发生本土被入侵的情况下，才能同意核打击相关行动，否则强制驳回。
9. **核武库真实演变基线**：在1949年之前，苏联不具备实际部署核武的能力，若违反需予以驳回。
10. **回合顺序严格一致**：严格根据当前回合的 phase 与玩家提交的 side 结算，不可跳过。
11. **输出格式强制 JSON**：只允许输出合法的 JSON，不能带任何 ```json 包裹或额外Markdown格式。
12. **数据变更幅度限制**：单次行动对玩家的 budgetChange, prestigeChange, publicSupportChange 调整幅度必须在 [-10, 10] 之间。
13. **信息不对称规则**：当玩家情报渗透度较低时，模糊或隐藏对方具体数据。
14. **不替玩家做决定**：结算中只叙述影响，不指导或规定玩家下一回合必须做什么。
15. **不改底层规则**：AI不能擅自增加或删减游戏的基本数值和属性体系。
16. **基于 GameState 事实**：结算叙事必须符合当前的游戏年份和国家地理状况。
17. **新闻倾向性**：新闻条目的 headline 必须带有明显的偏向性（亲美新闻 PRO_USA, 亲苏新闻 PRO_USSR, 中立 NEUTRAL），符合各自阵营的宣传调性。

### 【Layer 2 — 时代上下文】
- **当前年份**：${gameState?.year ?? 1945} 年（属于时代：${gameState?.currentEra ?? 'POST_WW2'}）
- **当前回合**：第 ${gameState?.turn ?? 1} 轮，阶段：${gameState?.phase ?? 'RESOLVE'}
- **全球紧张度 (0-100)**：${gameState?.globalTension ?? 20}
- **玩家阵营**：${side.toUpperCase()}
- **对手阵营情报渗透度**：${penetration}%
- **当前国家情报（已进行信息不对称过滤）**：
${JSON.stringify(filteredCountries, null, 2)}

### 【Layer 3 — 执行协议与事件概率表】
根据国家冷战分区间（CWS）调整本回合新事件（newEvent）发生的概率与类型：
- CWS < 30: 5% 概率触发危机, 30% 外交事件, 25% 经济事件, 15% 科技事件, 25% 无事。
- CWS 30-60: 20% 危机, 25% 外交, 20% 经济, 15% 科技, 20% 无事。
- CWS 60-85: 35% 危机, 20% 外交, 15% 经济, 10% 科技, 20% 无事。
- CWS > 85: 55% 危机, 15% 外交, 10% 经济, 5% 科技, 15% 无事。

必须返回以下结构的 JSON 数据，不要包含任何 markdown 代码块标记：
{
  "validated": true,
  "rejectionReason": "",
  "categoryMatch": true,
  "outcome": "详细的行动结算叙事描述",
  "effects": {
    "cwsChanges": {
      "country_id": 5
    },
    "influenceShift": [
      { "side": "usa", "country": "west_germany", "amount": 4 }
    ],
    "budgetChange": -3,
    "prestigeChange": 2,
    "publicSupportChange": 1,
    "globalTensionChange": 2
  },
  "newEvent": null, // 如果触发了新事件，则提供以下对象，否则为 null:
  // {
  //   "id": "event_id_lowercase",
  //   "name": "事件名称",
  //   "description": "事件详细描述",
  //   "durationTurns": 4,
  //   "cwsImpact": 5
  // },
  "newsHeadlines": [
    {
      "headline": "头条新闻标题",
      "summary": "简短摘要",
      "bias": "PRO_USA" // 或 "PRO_USSR" 或 "NEUTRAL"
    }
  ]
}`

    let content = ''
    if (provider === 'anthropic') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: `玩家行动：\n阵营：${side}\n类别：${action?.category}\n描述：${action?.description}\n\n请严格按照要求给出游戏结算JSON。`,
          }],
        }),
      })

      const data = await response.json()
      content = data.content?.[0]?.text || ''
    } else {
      // Default: OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `玩家行动：\n阵营：${side}\n类别：${action?.category}\n描述：${action?.description}\n\n请严格按照要求给出游戏结算JSON。` },
          ],
          temperature: 0.6,
          max_tokens: 1500,
        }),
      })

      const data = await response.json()
      content = data.choices?.[0]?.message?.content || ''
    }

    // Try parsing content safely
    let cleanJson = content.trim()
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```json|```/g, '').trim()
    }
    const result = JSON.parse(cleanJson)
    return NextResponse.json({ result })

  } catch (error: any) {
    console.error('AI Judge error:', error)
    return NextResponse.json({
      error: error.message || 'AI Judge failed to parse LLM response',
      useRuleEngine: true,
    }, { status: 500 })
  }
}
